#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol};

// ═══════════════════════════════════════════════════════════════
//  DATA TYPES
// ═══════════════════════════════════════════════════════════════

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Balance(Address),
    Admin,
    TotalMinted,
    TotalBurned,
}

/// Reward tier thresholds (lock duration in seconds → multiplier).
const TIER_BRONZE: u64 = 86_400;      // 1 day
const TIER_SILVER: u64 = 604_800;     // 1 week
const TIER_GOLD: u64 = 2_592_000;     // 30 days
const TIER_PLATINUM: u64 = 7_776_000; // 90 days

// ── Event symbols ──
const EVT_MINT: Symbol = symbol_short!("r_mint");
const EVT_BURN: Symbol = symbol_short!("r_burn");

// ═══════════════════════════════════════════════════════════════
//  CONTRACT
// ═══════════════════════════════════════════════════════════════

#[contract]
pub struct DripRewards;

#[contractimpl]
impl DripRewards {
    /// Initializes the admin (the PayVault contract address).
    /// Protected against double initialization.
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalMinted, &0_i128);
        env.storage().instance().set(&DataKey::TotalBurned, &0_i128);
    }

    /// Mints rewards. Only callable by the admin (PayVault).
    /// Legacy interface preserved exactly.
    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("Not initialized");
        admin.require_auth();

        if amount <= 0 {
            panic!("Mint amount must be positive");
        }

        let key = DataKey::Balance(to.clone());
        let mut balance: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        balance += amount;
        env.storage().persistent().set(&key, &balance);

        // Track total supply
        let mut total: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalMinted)
            .unwrap_or(0);
        total += amount;
        env.storage().instance().set(&DataKey::TotalMinted, &total);

        env.events().publish((EVT_MINT,), (to, amount));
    }

    /// Tiered minting — rewards multiplied based on lock duration.
    /// Bronze (1d): 1x, Silver (1w): 2x, Gold (30d): 4x, Platinum (90d): 8x.
    pub fn mint_tiered(env: Env, to: Address, base_amount: i128, lock_duration: u64) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("Not initialized");
        admin.require_auth();

        if base_amount <= 0 {
            panic!("Mint amount must be positive");
        }

        let multiplier = Self::calculate_tier_multiplier(lock_duration);
        let final_amount = base_amount * multiplier;

        let key = DataKey::Balance(to.clone());
        let mut balance: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        balance += final_amount;
        env.storage().persistent().set(&key, &balance);

        let mut total: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalMinted)
            .unwrap_or(0);
        total += final_amount;
        env.storage().instance().set(&DataKey::TotalMinted, &total);

        env.events()
            .publish((EVT_MINT,), (to, final_amount, multiplier));
    }

    /// Burns (spends) reward points. User must authorize.
    pub fn burn(env: Env, from: Address, amount: i128) {
        from.require_auth();

        if amount <= 0 {
            panic!("Burn amount must be positive");
        }

        let key = DataKey::Balance(from.clone());
        let balance: i128 = env.storage().persistent().get(&key).unwrap_or(0);

        if balance < amount {
            panic!("Insufficient reward balance");
        }

        env.storage().persistent().set(&key, &(balance - amount));

        let mut total_burned: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalBurned)
            .unwrap_or(0);
        total_burned += amount;
        env.storage()
            .instance()
            .set(&DataKey::TotalBurned, &total_burned);

        env.events().publish((EVT_BURN,), (from, amount));
    }

    /// Returns the reward balance for a user. Legacy interface preserved.
    pub fn balance(env: Env, user: Address) -> i128 {
        let key = DataKey::Balance(user);
        env.storage().persistent().get(&key).unwrap_or(0)
    }

    /// Returns total minted rewards across all users.
    pub fn total_minted(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalMinted)
            .unwrap_or(0)
    }

    /// Returns total burned rewards across all users.
    pub fn total_burned(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalBurned)
            .unwrap_or(0)
    }

    // ── Internal ──

    fn calculate_tier_multiplier(lock_duration: u64) -> i128 {
        if lock_duration >= TIER_PLATINUM {
            8
        } else if lock_duration >= TIER_GOLD {
            4
        } else if lock_duration >= TIER_SILVER {
            2
        } else {
            1
        }
    }
}

#[cfg(test)]
mod test;
