#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Balance(Address),
    Admin,
}

#[contract]
pub struct DripRewards;

#[contractimpl]
impl DripRewards {
    /// Initializes the admin (the PayVault contract address)
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    /// Mints rewards. Only callable by the admin (PayVault).
    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).expect("Not initialized");
        admin.require_auth();

        let key = DataKey::Balance(to.clone());
        let mut balance: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        balance += amount;
        env.storage().persistent().set(&key, &balance);
    }

    /// Returns the reward balance for a user.
    pub fn balance(env: Env, user: Address) -> i128 {
        let key = DataKey::Balance(user);
        env.storage().persistent().get(&key).unwrap_or(0)
    }
}
