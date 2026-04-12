#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Vault(Address, Address), // (User, Token)
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VaultEntry {
    pub amount: i128,
    pub unlock_time: u64,
}

#[contract]
pub struct PayVault;

#[contractimpl]
impl PayVault {
    /// Locks funds for a user.
    /// - `from`: The user address
    /// - `token`: The token address (e.g. XLM native token)
    /// - `amount`: Amount to lock
    /// - `unlock_time`: Unix timestamp (seconds) when funds can be released
    pub fn lock(env: Env, from: Address, token: Address, amount: i128, unlock_time: u64) {
        from.require_auth();

        // 1. Transfer tokens from 'from' to this contract
        let client = soroban_sdk::token::Client::new(&env, &token);
        client.transfer(&from, &env.current_contract_address(), &amount);

        // 2. Store the vault entry
        let key = DataKey::Vault(from.clone(), token.clone());
        let mut entry = env.storage().persistent().get::<_, VaultEntry>(&key).unwrap_or(VaultEntry {
            amount: 0,
            unlock_time: 0,
        });

        entry.amount += amount;
        entry.unlock_time = unlock_time; // Overwrites with new time if depositing again

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

        // Transfer tokens back to user
        let client = soroban_sdk::token::Client::new(&env, &token);
        client.transfer(&env.current_contract_address(), &user, &entry.amount);

        // Remove from storage
        env.storage().persistent().remove(&key);
    }
}

#[cfg(test)]
mod test;
