#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Vault(Address, Address), // (User, Token)
    RewardsContract,
}

mod rewards {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32-unknown-unknown/release/drip_rewards.wasm"
    );
}

#[contract]
pub struct PayVault;

#[contractimpl]
impl PayVault {
    pub fn set_rewards(env: Env, rewards_id: Address) {
        // In a real prod app, this would be admin-only
        env.storage().instance().set(&DataKey::RewardsContract, &rewards_id);
    }

    /// Locks funds for a user.
    pub fn lock(env: Env, from: Address, token: Address, amount: i128, unlock_time: u64) {
        from.require_auth();

        let client = soroban_sdk::token::Client::new(&env, &token);
        client.transfer(&from, &env.current_contract_address(), &amount);

        let key = DataKey::Vault(from.clone(), token.clone());
        let mut entry = env.storage().persistent().get::<_, VaultEntry>(&key).unwrap_or(VaultEntry {
            amount: 0,
            unlock_time: 0,
        });

        entry.amount += amount;
        entry.unlock_time = unlock_time;
        env.storage().persistent().set(&key, &entry);
    }

    /// Fetches the current locked amount for a user.
    pub fn get_vault(env: Env, user: Address, token: Address) -> VaultEntry {
        let key = DataKey::Vault(user, token);
        env.storage().persistent().get::<_, VaultEntry>(&key).unwrap_or(VaultEntry {
            amount: 0,
            unlock_time: 0,
        })
    }

    /// Releases funds back to the user if the unlock time has passed.
    pub fn claim(env: Env, user: Address, token: Address) {
        user.require_auth();

        let key = DataKey::Vault(user.clone(), token.clone());
        let entry = env.storage().persistent().get::<_, VaultEntry>(&key).expect("No vault found for this user/token");

        if env.ledger().timestamp() < entry.unlock_time {
            panic!("Unlock time has not been reached yet");
        }

        // 1. Transfer tokens back to user
        let client = soroban_sdk::token::Client::new(&env, &token);
        client.transfer(&env.current_contract_address(), &user, &entry.amount);

        // 2. Clear vault
        env.storage().persistent().remove(&key);

        // 3. NEW: Mint rewards for the user (Inter-contract call)
        if let Some(rewards_id) = env.storage().instance().get::<_, Address>(&DataKey::RewardsContract) {
            let rewards_client = rewards::Client::new(&env, &rewards_id);
            rewards_client.mint(&user, &100); // Reward 100 points
        }
    }
}

#[cfg(test)]
mod test;
