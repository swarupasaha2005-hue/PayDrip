import { Horizon, TransactionBuilder, Networks, Asset, Operation } from '@stellar/stellar-sdk';
import { isConnected, requestAccess, signTransaction } from '@stellar/freighter-api';

const horizonUrl = 'https://horizon-testnet.stellar.org';
const server = new Horizon.Server(horizonUrl);
const networkPassphrase = Networks.TESTNET;

export async function checkFreighterInstalled() {
  const result = await isConnected();
  // isConnected returns { isConnected: boolean, error? }
  return result && (result.isConnected === true || result === true);
}

export async function connectWallet() {
  const installed = await checkFreighterInstalled();
  if (!installed) {
    throw new Error('Freighter is not installed. Please install the Freighter browser extension.');
  }

  // requestAccess returns { address: string, error?: string }
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
      return '0 (Unfunded)';
    }
    throw error;
  }
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

  // signTransaction returns { signedTransaction: string, signerAddress: string, error?: string }
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
