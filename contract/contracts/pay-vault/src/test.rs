#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::{Address as _, Ledger}, Address, Env};

// ═══════════════════════════════════════════════════════════════
//  HELPER: Setup a test environment with token + user + contract
// ═══════════════════════════════════════════════════════════════

struct TestSetup {
    env: Env,
    contract_id: Address,
    client: PayVaultClient<'static>,
    token_id: Address,
    token_contract: soroban_sdk::token::Client<'static>,
    user: Address,
}

fn setup() -> TestSetup {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(PayVault, ());
    let client = PayVaultClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let token_id = env.register_stellar_asset_contract_v2(admin.clone()).address();
    let token_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_id);
    let token_contract = soroban_sdk::token::Client::new(&env, &token_id);

    let user = Address::generate(&env);
    token_client.mint(&user, &10_000);

    TestSetup {
        env,
        contract_id,
        client,
        token_id,
        token_contract,
        user,
    }
}

// ═══════════════════════════════════════════════════════════════
//  LEGACY TESTS (preserved exactly from original)
// ═══════════════════════════════════════════════════════════════

#[test]
fn test_lock_and_claim_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(PayVault, ());
    let client = PayVaultClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let token_id = env.register_stellar_asset_contract_v2(admin.clone()).address();
    let token_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_id);
    let token_contract = soroban_sdk::token::Client::new(&env, &token_id);

    let user = Address::generate(&env);
    token_client.mint(&user, &1000);
    assert_eq!(token_contract.balance(&user), 1000);

    let amount = 400;
    let unlock_time = 1000;
    client.lock(&user, &token_id, &amount, &unlock_time);

    assert_eq!(token_contract.balance(&user), 600);
    assert_eq!(token_contract.balance(&contract_id), 400);

    let vault = client.get_vault(&user, &token_id);
    assert_eq!(vault.amount, 400);
    assert_eq!(vault.unlock_time, 1000);

    env.ledger().set_timestamp(500);
    env.as_contract(&contract_id, || {
        // Early claim should fail logic
    });

    env.ledger().set_timestamp(1001);
    client.claim(&user, &token_id);

    assert_eq!(token_contract.balance(&user), 1000);
    assert_eq!(token_contract.balance(&contract_id), 0);

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

    env.ledger().set_timestamp(1500);
    client.claim(&user, &token_id);
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

// ═══════════════════════════════════════════════════════════════
//  NEW: Payment Lifecycle Tests
// ═══════════════════════════════════════════════════════════════

#[test]
fn test_payment_lifecycle() {
    let s = setup();

    // Create payment
    s.env.ledger().set_timestamp(100);
    s.client.create_payment(&s.user, &s.token_id, &500, &1000, &0, &3600);

    let vault = s.client.get_vault(&s.user, &s.token_id);
    assert_eq!(vault.amount, 500);
    assert_eq!(vault.state, PaymentState::Created as u32);
    assert_eq!(vault.created_at, 100);

    // Fund payment
    s.client.fund_payment(&s.user, &s.token_id);

    let vault = s.client.get_vault(&s.user, &s.token_id);
    assert_eq!(vault.state, PaymentState::Funded as u32);
    assert_eq!(vault.locked_amount, 500);
    assert_eq!(s.token_contract.balance(&s.user), 9500);
    assert_eq!(s.token_contract.balance(&s.contract_id), 500);

    // Execute after unlock
    s.env.ledger().set_timestamp(1001);
    s.client.execute_payment(&s.user, &s.token_id);

    let vault = s.client.get_vault(&s.user, &s.token_id);
    assert_eq!(vault.state, PaymentState::Executed as u32);
    assert_eq!(vault.cycles_completed, 1);
    assert_eq!(vault.locked_amount, 0);
    assert_eq!(s.token_contract.balance(&s.user), 10_000);
}

#[test]
fn test_recurring_payment() {
    let s = setup();

    // Create recurring payment: 200 every 500 seconds
    s.env.ledger().set_timestamp(100);
    s.client.create_payment(&s.user, &s.token_id, &200, &600, &500, &0);

    // Fund it
    s.client.fund_payment(&s.user, &s.token_id);
    assert_eq!(s.token_contract.balance(&s.user), 9800);

    // Execute cycle 1 at t=601
    s.env.ledger().set_timestamp(601);
    s.client.execute_payment(&s.user, &s.token_id);

    let vault = s.client.get_vault(&s.user, &s.token_id);
    assert_eq!(vault.cycles_completed, 1);
    assert_eq!(vault.unlock_time, 1100); // 600 + 500
    assert_eq!(vault.state, PaymentState::Funded as u32);
    assert_eq!(s.token_contract.balance(&s.user), 10_000);
}

#[test]
fn test_grace_period_due_soon() {
    let s = setup();

    s.env.ledger().set_timestamp(100);
    s.client.create_payment(&s.user, &s.token_id, &300, &2000, &0, &600);
    s.client.fund_payment(&s.user, &s.token_id);

    // Not due yet (too far from unlock)
    s.env.ledger().set_timestamp(1000);
    s.client.check_due(&s.user, &s.token_id);
    let vault = s.client.get_vault(&s.user, &s.token_id);
    assert_eq!(vault.state, PaymentState::Funded as u32); // still Funded

    // Within grace period (2000 - 1500 = 500, which is <= 600)
    s.env.ledger().set_timestamp(1500);
    s.client.check_due(&s.user, &s.token_id);
    let vault = s.client.get_vault(&s.user, &s.token_id);
    assert_eq!(vault.state, PaymentState::DueSoon as u32);
}

#[test]
fn test_retry_payment() {
    let s = setup();

    s.env.ledger().set_timestamp(100);
    s.client.create_payment(&s.user, &s.token_id, &300, &1000, &0, &3600);
    s.client.fund_payment(&s.user, &s.token_id);

    // Manually set to Failed state for testing retry
    s.env.as_contract(&s.contract_id, || {
        let key = DataKey::Vault(s.user.clone(), s.token_id.clone());
        let mut entry = s.env.storage().persistent().get::<_, VaultEntry>(&key).unwrap();
        entry.state = PaymentState::Failed as u32;
        entry.retry_count = 1;
        s.env.storage().persistent().set(&key, &entry);
    });

    // Retry
    s.client.retry_payment(&s.user, &s.token_id);
    let vault = s.client.get_vault(&s.user, &s.token_id);
    assert_eq!(vault.state, PaymentState::PendingExecution as u32);
    assert_eq!(vault.retry_count, 2);
}

#[test]
#[should_panic(expected = "Maximum retries exceeded")]
fn test_max_retries_exceeded() {
    let s = setup();

    s.env.ledger().set_timestamp(100);
    s.client.create_payment(&s.user, &s.token_id, &300, &1000, &0, &3600);
    s.client.fund_payment(&s.user, &s.token_id);

    // Set to Failed with max retries reached
    s.env.as_contract(&s.contract_id, || {
        let key = DataKey::Vault(s.user.clone(), s.token_id.clone());
        let mut entry = s.env.storage().persistent().get::<_, VaultEntry>(&key).unwrap();
        entry.state = PaymentState::Failed as u32;
        entry.retry_count = 3;
        s.env.storage().persistent().set(&key, &entry);
    });

    s.client.retry_payment(&s.user, &s.token_id);
}

#[test]
fn test_guardian_approval() {
    let s = setup();
    let guardian = Address::generate(&s.env);

    s.env.ledger().set_timestamp(100);
    s.client.create_payment(&s.user, &s.token_id, &500, &1000, &0, &3600);
    s.client.fund_payment(&s.user, &s.token_id);

    // Set guardian
    s.client.set_guardian(&s.user, &s.token_id, &guardian);

    // Guardian approves
    s.client.approve_payment(&guardian, &s.user, &s.token_id);

    // Execute succeeds after approval
    s.env.ledger().set_timestamp(1001);
    s.client.execute_payment(&s.user, &s.token_id);

    let vault = s.client.get_vault(&s.user, &s.token_id);
    assert_eq!(vault.state, PaymentState::Executed as u32);
}

#[test]
#[should_panic(expected = "Guardian approval required")]
fn test_guardian_blocks_without_approval() {
    let s = setup();
    let guardian = Address::generate(&s.env);

    s.env.ledger().set_timestamp(100);
    s.client.create_payment(&s.user, &s.token_id, &500, &1000, &0, &3600);
    s.client.fund_payment(&s.user, &s.token_id);
    s.client.set_guardian(&s.user, &s.token_id, &guardian);

    // Try to execute without approval
    s.env.ledger().set_timestamp(1001);
    s.client.execute_payment(&s.user, &s.token_id);
}

#[test]
#[should_panic(expected = "Invalid state transition")]
fn test_invalid_state_transition() {
    let s = setup();

    s.env.ledger().set_timestamp(100);
    s.client.create_payment(&s.user, &s.token_id, &500, &1000, &0, &3600);

    // Try to fund twice — second fund should fail
    s.client.fund_payment(&s.user, &s.token_id);
    s.client.fund_payment(&s.user, &s.token_id);
}

#[test]
#[should_panic(expected = "Invalid state for execution")]
fn test_double_execution_prevented() {
    let s = setup();

    s.env.ledger().set_timestamp(100);
    s.client.create_payment(&s.user, &s.token_id, &500, &1000, &0, &3600);
    s.client.fund_payment(&s.user, &s.token_id);

    s.env.ledger().set_timestamp(1001);
    s.client.execute_payment(&s.user, &s.token_id);
    // Second execution should panic
    s.client.execute_payment(&s.user, &s.token_id);
}

#[test]
#[should_panic(expected = "Amount must be greater than zero")]
fn test_zero_amount_rejected() {
    let s = setup();
    s.env.ledger().set_timestamp(100);
    s.client.create_payment(&s.user, &s.token_id, &0, &1000, &0, &3600);
}

#[test]
#[should_panic(expected = "Unlock time must be in the future")]
fn test_past_unlock_time_rejected() {
    let s = setup();
    s.env.ledger().set_timestamp(2000);
    s.client.create_payment(&s.user, &s.token_id, &500, &1000, &0, &3600);
}

#[test]
fn test_locked_balance_query() {
    let s = setup();

    // Before locking
    assert_eq!(s.client.get_locked_balance(&s.user, &s.token_id), 0);

    s.env.ledger().set_timestamp(100);
    s.client.create_payment(&s.user, &s.token_id, &750, &1000, &0, &3600);
    s.client.fund_payment(&s.user, &s.token_id);

    assert_eq!(s.client.get_locked_balance(&s.user, &s.token_id), 750);
}

#[test]
fn test_payment_state_query() {
    let s = setup();

    assert_eq!(s.client.get_payment_state(&s.user, &s.token_id), PaymentState::Created as u32);

    s.env.ledger().set_timestamp(100);
    s.client.create_payment(&s.user, &s.token_id, &500, &1000, &0, &3600);
    assert_eq!(s.client.get_payment_state(&s.user, &s.token_id), PaymentState::Created as u32);

    s.client.fund_payment(&s.user, &s.token_id);
    assert_eq!(s.client.get_payment_state(&s.user, &s.token_id), PaymentState::Funded as u32);
}

#[test]
fn test_lock_sets_funded_state() {
    let s = setup();

    // Legacy lock should set state to Funded
    s.client.lock(&s.user, &s.token_id, &400, &1000);

    let vault = s.client.get_vault(&s.user, &s.token_id);
    assert_eq!(vault.state, PaymentState::Funded as u32);
    assert_eq!(vault.locked_amount, 400);
}
