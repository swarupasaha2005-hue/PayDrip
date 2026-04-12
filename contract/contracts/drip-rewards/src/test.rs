#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_rewards_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, DripRewards);
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
    let contract_id = env.register_contract(None, DripRewards);
    let client = DripRewardsClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.init(&admin);
    client.init(&admin);
}
