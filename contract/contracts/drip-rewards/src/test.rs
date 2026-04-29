#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

// ═══════════════════════════════════════════════════════════════
//  LEGACY TESTS (preserved exactly)
// ═══════════════════════════════════════════════════════════════

#[test]
fn test_rewards_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(DripRewards, ());
    let client = DripRewardsClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    client.init(&admin);

    // Admin mints 50 rewards
    client.mint(&user, &50);
    assert_eq!(client.balance(&user), 50);

    // Admin mints more
    client.mint(&user, &100);
    assert_eq!(client.balance(&user), 150);
}

#[test]
#[should_panic(expected = "Already initialized")]
fn test_double_init_panics() {
    let env = Env::default();
    let contract_id = env.register(DripRewards, ());
    let client = DripRewardsClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.init(&admin);
    client.init(&admin);
}

// ═══════════════════════════════════════════════════════════════
//  NEW TESTS
// ═══════════════════════════════════════════════════════════════

#[test]
fn test_burn_rewards() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(DripRewards, ());
    let client = DripRewardsClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    client.init(&admin);
    client.mint(&user, &200);
    assert_eq!(client.balance(&user), 200);

    // Burn 80
    client.burn(&user, &80);
    assert_eq!(client.balance(&user), 120);

    // Burn rest
    client.burn(&user, &120);
    assert_eq!(client.balance(&user), 0);
}

#[test]
#[should_panic(expected = "Insufficient reward balance")]
fn test_burn_exceeds_balance() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(DripRewards, ());
    let client = DripRewardsClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    client.init(&admin);
    client.mint(&user, &50);
    client.burn(&user, &100); // Should panic
}

#[test]
fn test_tiered_minting_bronze() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(DripRewards, ());
    let client = DripRewardsClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    client.init(&admin);

    // Short lock (< 1 day) → 1x multiplier
    client.mint_tiered(&user, &100, &3600);
    assert_eq!(client.balance(&user), 100); // 100 * 1
}

#[test]
fn test_tiered_minting_silver() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(DripRewards, ());
    let client = DripRewardsClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    client.init(&admin);

    // 1 week lock → 2x multiplier
    client.mint_tiered(&user, &100, &604_800);
    assert_eq!(client.balance(&user), 200); // 100 * 2
}

#[test]
fn test_tiered_minting_gold() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(DripRewards, ());
    let client = DripRewardsClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    client.init(&admin);

    // 30 day lock → 4x multiplier
    client.mint_tiered(&user, &100, &2_592_000);
    assert_eq!(client.balance(&user), 400); // 100 * 4
}

#[test]
fn test_tiered_minting_platinum() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(DripRewards, ());
    let client = DripRewardsClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    client.init(&admin);

    // 90 day lock → 8x multiplier
    client.mint_tiered(&user, &100, &7_776_000);
    assert_eq!(client.balance(&user), 800); // 100 * 8
}

#[test]
fn test_total_supply_tracking() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(DripRewards, ());
    let client = DripRewardsClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    client.init(&admin);

    client.mint(&user1, &100);
    client.mint(&user2, &200);

    assert_eq!(client.total_minted(), 300);
    assert_eq!(client.total_burned(), 0);

    client.burn(&user1, &50);
    assert_eq!(client.total_burned(), 50);
}

#[test]
#[should_panic(expected = "Mint amount must be positive")]
fn test_zero_mint_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(DripRewards, ());
    let client = DripRewardsClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    client.init(&admin);
    client.mint(&user, &0);
}

#[test]
#[should_panic(expected = "Burn amount must be positive")]
fn test_zero_burn_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(DripRewards, ());
    let client = DripRewardsClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    client.init(&admin);
    client.mint(&user, &100);
    client.burn(&user, &0);
}
