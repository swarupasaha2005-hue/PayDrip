#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::{Address as _, Ledger}, Address, Env};

#[test]
fn test_lock_and_claim_flow() {
    let env = Env::default();
    env.mock_all_auths();

    // 1. Setup Contract
    let contract_id = env.register(PayVault, ());
    let client = PayVaultClient::new(&env, &contract_id);

    // 2. Setup Mock Native Token (XLM)
    let admin = Address::generate(&env);
    let token_id = env.register_stellar_asset_contract_v2(admin.clone()).address();
    let token_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_id);
    let token_contract = soroban_sdk::token::Client::new(&env, &token_id);

    // 3. Setup User and Mint tokens
    let user = Address::generate(&env);
    token_client.mint(&user, &1000);
    assert_eq!(token_contract.balance(&user), 1000);

    // 4. Test: Lock 400 XLM until timestamp 1000
    let amount = 400;
    let unlock_time = 1000;
    client.lock(&user, &token_id, &amount, &unlock_time);

    // Verify balances after lock
    assert_eq!(token_contract.balance(&user), 600);
    assert_eq!(token_contract.balance(&contract_id), 400);

    // Verify storage
    let vault = client.get_vault(&user, &token_id);
    assert_eq!(vault.amount, 400);
    assert_eq!(vault.unlock_time, 1000);

    // 5. Test: Claim before maturity (Should panic)
    env.ledger().set_timestamp(500);
    env.as_contract(&contract_id, || {
        // Early claim should fail logic
    });

    // 6. Test: Claim after maturity
    env.ledger().set_timestamp(1001);
    client.claim(&user, &token_id);

    // Verify final balances
    assert_eq!(token_contract.balance(&user), 1000);
    assert_eq!(token_contract.balance(&contract_id), 0);

    // Verify storage cleared
    let vault_after = client.get_vault(&user, &token_id);
    assert_eq!(vault_after.amount, 0);
}

#[test]
#[should_panic(expected = "Unlock time has not been reached yet")]
fn test_claim_too_early_panics() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(PayVault, ());
    let client = PayVaultClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let token_id = env.register_stellar_asset_contract_v2(admin).address();
    let token_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_id);

    let user = Address::generate(&env);
    token_client.mint(&user, &1000);

    client.lock(&user, &token_id, &500, &2000);
    
    env.ledger().set_timestamp(1500); // Before 2000
    client.claim(&user, &token_id); // Should panic
}

#[test]
fn test_get_empty_vault() {
    let env = Env::default();
    let contract_id = env.register(PayVault, ());
    let client = PayVaultClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let token = Address::generate(&env);

    let vault = client.get_vault(&user, &token);
    assert_eq!(vault.amount, 0);
    assert_eq!(vault.unlock_time, 0);
}
