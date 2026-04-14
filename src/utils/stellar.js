import { Horizon, rpc, TransactionBuilder, Networks, Asset, Contract, scValToNative, nativeToScVal, Address, Account, Operation } from '@stellar/stellar-sdk';
import { isConnected, requestAccess, signTransaction } from '@stellar/freighter-api';

const horizonUrl = 'https://horizon-testnet.stellar.org';
const rpcUrl = 'https://soroban-testnet.stellar.org';
const server = new Horizon.Server(horizonUrl);
const rpcServer = new rpc.Server(rpcUrl);
const networkPassphrase = Networks.TESTNET;

/**
 * Polls for transaction status until it's finished or timeouts
 */
export async function waitForTransaction(txHash) {
  let attempts = 0;
  while (attempts < 20) {
    const res = await rpcServer.getTransaction(txHash);
    if (res.status === 'SUCCESS') return { status: 'SUCCESS', result: res };
    if (res.status === 'FAILED')  throw new Error('Transaction failed');
    await new Promise(r => setTimeout(r, 3000));
    attempts++;
  }
  throw new Error('Transaction timed out');
}

// Our deployed contracts
export const VAULT_CONTRACT_ID = 'CDL52WTKS4YCXTCSMY2MCVJ2O3DPO2ET7EWXJIQMRP75I6O5ILGFDLWU';
export const REWARDS_CONTRACT_ID = 'CDL52WTKS4YCXTCSMY2MCVJ2O3DPO2ET7EWXJIQMRP75I6O5ILGFDLWU'; // Placeholder: Valid checksum ID to prevent SDK crashes
// Native XLM token in Soroban
export const NATIVE_XLM_ID = 'CDLZFC3SYJYDZT7K67VZ75YJBMKBAV26RZ6SNTLMHRPZ2RV7GT3S6YTM';

/**
 * Fetches reward points from the DripRewards contract
 */
export async function fetchRewardsBalance(publicKey) {
  try {
    const contract = new Contract(REWARDS_CONTRACT_ID);
    const result = await rpcServer.simulateTransaction(
      new TransactionBuilder(new Account(publicKey, '0'), { fee: '100', networkPassphrase })
        .addOperation(contract.call('balance', nativeToScVal(publicKey, { type: 'address' })))
        .setTimeout(30)
        .build()
    );

    if (rpc.Api.isSimulationSuccess(result)) {
      const balance = scValToNative(result.result.retval);
      return balance ? balance.toString() : '0';
    }
    return '0';
  } catch (err) {
    console.error('Fetch rewards error:', err);
    return '0';
  }
}


export async function checkFreighterInstalled() {
  const result = await isConnected();
  return result && (result.isConnected === true || result === true);
}

export async function connectWallet() {
  const installed = await checkFreighterInstalled();
  if (!installed) {
    throw new Error('Freighter is not installed. Please install the Freighter browser extension.');
  }

  const result = await requestAccess();
  if (result.error) {
    throw new Error(result.error);
  }
  if (!result.address) {
    throw new Error('No address returned from Freighter. Did you deny access?');
  }
  return result.address;
}

export async function fetchBalance(publicKey) {
  try {
    const account = await server.loadAccount(publicKey);
    const nativeBalance = account.balances.find((b) => b.asset_type === 'native');
    return nativeBalance ? nativeBalance.balance : '0';
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return '0';
    }
    throw error;
  }
}

/** 
 * Fetches locked amount from the Soroban contract 
 */
export async function fetchLockedAmount(publicKey) {
  try {
    const contract = new Contract(VAULT_CONTRACT_ID);
    const result = await rpcServer.simulateTransaction(
      new TransactionBuilder(new Account(publicKey, '0'), { fee: '100', networkPassphrase })
        .addOperation(contract.call('get_vault', nativeToScVal(publicKey, { type: 'address' }), nativeToScVal(NATIVE_XLM_ID, { type: 'address' })))
        .setTimeout(30)
        .build()
    );

    if (rpc.Api.isSimulationSuccess(result)) {
      const entry = scValToNative(result.result.retval);
      // entry is { amount: i128, unlock_time: u64 }
      return entry && entry.amount ? (Number(entry.amount) / 10000000).toString() : '0';
    }
    return '0';
  } catch (err) {
    console.error('Fetch locked amount error:', err);
    return '0';
  }
}

/**
 * Common helper for Soroban transactions
 */
async function submitSorobanTx(sourceAddress, operation) {
  const account = await server.loadAccount(sourceAddress);
  const tx = new TransactionBuilder(account, {
    fee: '10000', // Higher fee for Soroban
    networkPassphrase,
  })
    .addOperation(operation)
    .setTimeout(60)
    .build();

  // Soroban requires simulation to fill in footprint and resource fees
  const simulated = await rpcServer.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simulated)) {
    throw new Error(`Simulation failed: ${simulated.error}`);
  }

  const preparedTx = rpc.assembleTransaction(tx, simulated);

  const signResult = await signTransaction(preparedTx.toXDR(), {
    networkPassphrase,
  });

  if (signResult.error) {
    throw new Error(signResult.error);
  }

  const signedTx = TransactionBuilder.fromXDR(signResult.signedTransaction, networkPassphrase);
  const response = await rpcServer.sendTransaction(signedTx);
  
  if (response.status === 'ERROR') {
    throw new Error(`Transaction failed: ${JSON.stringify(response.errorResultXdr)}`);
  }

  return response;
}

/**
 * Lock funds on the smart contract
 */
export async function lockFundsOnChain(userAddress, amount, unlockSeconds) {
  const contract = new Contract(VAULT_CONTRACT_ID);
  const amountRaw = BigInt(Math.floor(Number(amount) * 10000000)); // Stroops
  
  const op = contract.call(
    'lock',
    nativeToScVal(userAddress, { type: 'address' }),
    nativeToScVal(NATIVE_XLM_ID, { type: 'address' }),
    nativeToScVal(amountRaw, { type: 'i128' }),
    nativeToScVal(BigInt(unlockSeconds), { type: 'u64' })
  );

  return await submitSorobanTx(userAddress, op);
}

/**
 * Claim funds back from the contract
 */
export async function claimFundsOnChain(userAddress) {
  const contract = new Contract(VAULT_CONTRACT_ID);
  const op = contract.call(
    'claim',
    nativeToScVal(userAddress, { type: 'address' }),
    nativeToScVal(NATIVE_XLM_ID, { type: 'address' })
  );

  return await submitSorobanTx(userAddress, op);
}

export async function sendPayment(sourcePublicKey, destinationPublicKey, amount) {
  const account = await server.loadAccount(sourcePublicKey);
  const fee = await server.fetchBaseFee();

  const transaction = new TransactionBuilder(account, {
    fee,
    networkPassphrase,
  })
    .addOperation(
      Operation.payment({
        destination: destinationPublicKey,
        asset: Asset.native(),
        amount: amount.toString(),
      })
    )
    .setTimeout(30)
    .build();

  const signResult = await signTransaction(transaction.toXDR(), {
    networkPassphrase,
  });

  if (signResult.error) {
    throw new Error(signResult.error);
  }

  const signedTx = TransactionBuilder.fromXDR(signResult.signedTransaction, networkPassphrase);
  const response = await server.submitTransaction(signedTx);
  return response;
}
