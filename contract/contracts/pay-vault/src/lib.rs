#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol};

// ═══════════════════════════════════════════════════════════════
//  DATA TYPES & STORAGE KEYS
// ═══════════════════════════════════════════════════════════════

/// Payment lifecycle states — enforced state machine.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq, Copy)]
#[repr(u32)]
pub enum PaymentState {
    Created = 0,
    Funded = 1,
    DueSoon = 2,
    PendingExecution = 3,
    Executed = 4,
    Failed = 5,
}

/// Storage key discriminants.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Vault(Address, Address),      // (User, Token) — legacy + new
    RewardsContract,
    Admin,
    Guardian(Address, Address),   // (User, Token) → guardian address
    Approval(Address, Address),   // (User, Token) → bool approved
    Nonce(Address),               // re-entrancy / double-exec nonce
}

/// The core vault entry — backwards-compatible with legacy fields,
/// extended with production-grade fields.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VaultEntry {
    // ── Legacy fields (preserved) ──
    pub amount: i128,
    pub unlock_time: u64,

    // ── Production fields ──
    pub state: u32,              // PaymentState as u32 for storage compat
    pub locked_amount: i128,     // funds reserved, cannot withdraw
    pub frequency: u64,          // recurring cycle in seconds (0 = one-time)
    pub cycles_completed: u32,   // how many executions completed
    pub grace_period: u64,       // seconds before marking failed
    pub retry_count: u32,        // current retry attempts
    pub max_retries: u32,        // max allowed retries
    pub created_at: u64,         // creation timestamp
}

impl VaultEntry {
    /// Default empty vault — backwards compatible with legacy code.
    pub fn empty() -> Self {
        VaultEntry {
            amount: 0,
            unlock_time: 0,
            state: PaymentState::Created as u32,
            locked_amount: 0,
            frequency: 0,
            cycles_completed: 0,
            grace_period: 3600, // 1 hour default
            retry_count: 0,
            max_retries: 3,
            created_at: 0,
        }
    }

    pub fn payment_state(&self) -> PaymentState {
        match self.state {
            0 => PaymentState::Created,
            1 => PaymentState::Funded,
            2 => PaymentState::DueSoon,
            3 => PaymentState::PendingExecution,
            4 => PaymentState::Executed,
            5 => PaymentState::Failed,
            _ => panic!("Invalid payment state"),
        }
    }
}

// ── Cross-contract import for rewards ──
mod rewards {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32v1-none/release/drip_rewards.wasm"
    );
}

// ── Event symbols ──
const EVT_CREATED: Symbol = symbol_short!("p_create");
const EVT_FUNDED: Symbol = symbol_short!("p_fund");
const EVT_DUE: Symbol = symbol_short!("p_due");
const EVT_EXEC: Symbol = symbol_short!("p_exec");
const EVT_FAIL: Symbol = symbol_short!("p_fail");
const EVT_RETRY: Symbol = symbol_short!("p_retry");
const EVT_APPROVE: Symbol = symbol_short!("p_approv");

// ═══════════════════════════════════════════════════════════════
//  CONTRACT
// ═══════════════════════════════════════════════════════════════

#[contract]
pub struct PayVault;

#[contractimpl]
impl PayVault {
    // ───────────────────────────────────────────────────────────
    //  ADMIN
    // ───────────────────────────────────────────────────────────

    /// Initialize admin with re-init protection.
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    /// Set rewards contract address. Admin-only in production.
    pub fn set_rewards(env: Env, rewards_id: Address) {
        env.storage()
            .instance()
            .set(&DataKey::RewardsContract, &rewards_id);
    }

    // ───────────────────────────────────────────────────────────
    //  LEGACY API (preserved exactly)
    // ───────────────────────────────────────────────────────────

    /// Locks funds for a user. Legacy interface preserved.
    /// Internally creates a Funded vault entry.
    pub fn lock(env: Env, from: Address, token: Address, amount: i128, unlock_time: u64) {
        from.require_auth();
        Self::validate_amount(amount);

        let client = soroban_sdk::token::Client::new(&env, &token);
        client.transfer(&from, &env.current_contract_address(), &amount);

        let key = DataKey::Vault(from.clone(), token.clone());
        let mut entry = env
            .storage()
            .persistent()
            .get::<_, VaultEntry>(&key)
            .unwrap_or(VaultEntry::empty());

        entry.amount += amount;
        entry.locked_amount += amount;
        entry.unlock_time = unlock_time;
        entry.state = PaymentState::Funded as u32;
        if entry.created_at == 0 {
            entry.created_at = env.ledger().timestamp();
        }

        env.storage().persistent().set(&key, &entry);

        // Emit events
        env.events().publish((EVT_FUNDED,), (from, amount));
    }

    /// Fetches the current vault for a user. Legacy interface preserved.
    pub fn get_vault(env: Env, user: Address, token: Address) -> VaultEntry {
        let key = DataKey::Vault(user, token);
        env.storage()
            .persistent()
            .get::<_, VaultEntry>(&key)
            .unwrap_or(VaultEntry::empty())
    }

    /// Releases funds back to the user if the unlock time has passed.
    /// Legacy interface preserved, with added state validation.
    pub fn claim(env: Env, user: Address, token: Address) {
        user.require_auth();

        let key = DataKey::Vault(user.clone(), token.clone());
        let entry = env
            .storage()
            .persistent()
            .get::<_, VaultEntry>(&key)
            .expect("No vault found for this user/token");

        // State validation: must be Funded or DueSoon or PendingExecution
        let st = entry.payment_state();
        if st == PaymentState::Executed {
            panic!("Payment already executed");
        }

        if env.ledger().timestamp() < entry.unlock_time {
            panic!("Unlock time has not been reached yet");
        }

        // Transfer tokens back
        let client = soroban_sdk::token::Client::new(&env, &token);
        client.transfer(&env.current_contract_address(), &user, &entry.amount);

        // Clear vault
        env.storage().persistent().remove(&key);

        // Mint rewards via cross-contract call
        if let Some(rewards_id) = env
            .storage()
            .instance()
            .get::<_, Address>(&DataKey::RewardsContract)
        {
            let rewards_client = rewards::Client::new(&env, &rewards_id);
            rewards_client.mint(&user, &100);
        }

        env.events().publish((EVT_EXEC,), (user, entry.amount));
    }

    // ───────────────────────────────────────────────────────────
    //  PRODUCTION API — Payment Lifecycle
    // ───────────────────────────────────────────────────────────

    /// Create a payment in `Created` state without funding yet.
    pub fn create_payment(
        env: Env,
        from: Address,
        token: Address,
        amount: i128,
        unlock_time: u64,
        frequency: u64,
        grace_period: u64,
    ) {
        from.require_auth();
        Self::validate_amount(amount);
        Self::validate_time(&env, unlock_time);

        let key = DataKey::Vault(from.clone(), token.clone());
        if env.storage().persistent().has(&key) {
            let existing = env
                .storage()
                .persistent()
                .get::<_, VaultEntry>(&key)
                .unwrap();
            let st = existing.payment_state();
            if st != PaymentState::Executed && st != PaymentState::Failed {
                panic!("Active payment already exists for this user/token");
            }
        }

        let entry = VaultEntry {
            amount,
            unlock_time,
            state: PaymentState::Created as u32,
            locked_amount: 0,
            frequency,
            cycles_completed: 0,
            grace_period: if grace_period > 0 { grace_period } else { 3600 },
            retry_count: 0,
            max_retries: 3,
            created_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&key, &entry);
        env.events()
            .publish((EVT_CREATED,), (from, amount, unlock_time));
    }

    /// Fund a `Created` payment — transfers tokens and transitions to `Funded`.
    pub fn fund_payment(env: Env, from: Address, token: Address) {
        from.require_auth();

        let key = DataKey::Vault(from.clone(), token.clone());
        let mut entry = env
            .storage()
            .persistent()
            .get::<_, VaultEntry>(&key)
            .expect("No payment found");

        Self::assert_state_transition(entry.payment_state(), PaymentState::Funded);

        // Transfer tokens into the contract
        let client = soroban_sdk::token::Client::new(&env, &token);
        client.transfer(&from, &env.current_contract_address(), &entry.amount);

        entry.locked_amount = entry.amount;
        entry.state = PaymentState::Funded as u32;

        env.storage().persistent().set(&key, &entry);
        env.events()
            .publish((EVT_FUNDED,), (from, entry.locked_amount));
    }

    /// Check if a payment is approaching its due date.
    /// Transitions from `Funded` → `DueSoon` when within grace period.
    pub fn check_due(env: Env, user: Address, token: Address) {
        let key = DataKey::Vault(user.clone(), token.clone());
        let mut entry = env
            .storage()
            .persistent()
            .get::<_, VaultEntry>(&key)
            .expect("No payment found");

        let st = entry.payment_state();
        if st != PaymentState::Funded {
            panic!("Payment not in Funded state");
        }

        let now = env.ledger().timestamp();
        if entry.unlock_time > now && (entry.unlock_time - now) <= entry.grace_period {
            entry.state = PaymentState::DueSoon as u32;
            env.storage().persistent().set(&key, &entry);
            env.events().publish((EVT_DUE,), (user, entry.unlock_time));
        }
    }

    /// Execute a payment — validates state, timing, balance, and guardian.
    pub fn execute_payment(env: Env, user: Address, token: Address) {
        user.require_auth();

        let key = DataKey::Vault(user.clone(), token.clone());
        let mut entry = env
            .storage()
            .persistent()
            .get::<_, VaultEntry>(&key)
            .expect("No payment found");

        let st = entry.payment_state();

        // Must be Funded, DueSoon, or PendingExecution
        if st != PaymentState::Funded
            && st != PaymentState::DueSoon
            && st != PaymentState::PendingExecution
        {
            panic!("Invalid state for execution");
        }

        // Prevent double execution
        if st == PaymentState::Executed {
            panic!("Payment already executed");
        }

        // Time check
        let now = env.ledger().timestamp();
        if now < entry.unlock_time {
            panic!("Unlock time has not been reached yet");
        }

        // Guardian check — if a guardian is set, require approval
        let guardian_key = DataKey::Guardian(user.clone(), token.clone());
        if env.storage().persistent().has(&guardian_key) {
            let approval_key = DataKey::Approval(user.clone(), token.clone());
            let approved = env
                .storage()
                .persistent()
                .get::<_, bool>(&approval_key)
                .unwrap_or(false);
            if !approved {
                // Move to PendingExecution, waiting for guardian
                entry.state = PaymentState::PendingExecution as u32;
                env.storage().persistent().set(&key, &entry);
                panic!("Guardian approval required");
            }
            // Clear approval for next cycle
            env.storage().persistent().remove(&approval_key);
        }

        // Balance validation
        if entry.locked_amount < entry.amount {
            entry.state = PaymentState::Failed as u32;
            entry.retry_count += 1;
            env.storage().persistent().set(&key, &entry);
            env.events()
                .publish((EVT_FAIL,), (user, symbol_short!("bal_low")));
            panic!("Insufficient locked balance");
        }

        // Execute transfer
        let client = soroban_sdk::token::Client::new(&env, &token);
        client.transfer(&env.current_contract_address(), &user, &entry.amount);

        entry.cycles_completed += 1;

        // Handle recurring vs one-time
        if entry.frequency > 0 {
            // Recurring: advance to next cycle
            entry.unlock_time += entry.frequency;
            entry.locked_amount -= entry.amount;
            entry.state = PaymentState::Funded as u32;
            entry.retry_count = 0;
            env.storage().persistent().set(&key, &entry);
        } else {
            // One-time: mark as executed and clear
            entry.state = PaymentState::Executed as u32;
            entry.locked_amount = 0;
            env.storage().persistent().set(&key, &entry);
        }

        // Mint rewards
        if let Some(rewards_id) = env
            .storage()
            .instance()
            .get::<_, Address>(&DataKey::RewardsContract)
        {
            let rewards_client = rewards::Client::new(&env, &rewards_id);
            rewards_client.mint(&user, &100);
        }

        env.events()
            .publish((EVT_EXEC,), (user, entry.amount, entry.cycles_completed));
    }

    /// Retry a failed payment (within max_retries limit).
    pub fn retry_payment(env: Env, user: Address, token: Address) {
        user.require_auth();

        let key = DataKey::Vault(user.clone(), token.clone());
        let mut entry = env
            .storage()
            .persistent()
            .get::<_, VaultEntry>(&key)
            .expect("No payment found");

        if entry.payment_state() != PaymentState::Failed {
            panic!("Payment is not in Failed state");
        }

        if entry.retry_count >= entry.max_retries {
            panic!("Maximum retries exceeded");
        }

        entry.retry_count += 1;
        entry.state = PaymentState::PendingExecution as u32;
        env.storage().persistent().set(&key, &entry);

        env.events()
            .publish((EVT_RETRY,), (user, entry.retry_count));
    }

    // ───────────────────────────────────────────────────────────
    //  GUARDIAN / MULTI-SIG
    // ───────────────────────────────────────────────────────────

    /// Assign a guardian for a specific payment.
    pub fn set_guardian(env: Env, user: Address, token: Address, guardian: Address) {
        user.require_auth();

        let guardian_key = DataKey::Guardian(user.clone(), token.clone());
        env.storage().persistent().set(&guardian_key, &guardian);
    }

    /// Guardian approves a pending execution.
    pub fn approve_payment(env: Env, guardian: Address, user: Address, token: Address) {
        guardian.require_auth();

        // Verify this guardian is assigned
        let guardian_key = DataKey::Guardian(user.clone(), token.clone());
        let stored_guardian: Address = env
            .storage()
            .persistent()
            .get(&guardian_key)
            .expect("No guardian set for this payment");

        if stored_guardian != guardian {
            panic!("Unauthorized guardian");
        }

        let approval_key = DataKey::Approval(user.clone(), token.clone());
        env.storage().persistent().set(&approval_key, &true);

        env.events().publish((EVT_APPROVE,), (guardian, user));
    }

    // ───────────────────────────────────────────────────────────
    //  QUERY FUNCTIONS
    // ───────────────────────────────────────────────────────────

    /// Returns the locked balance for a user/token pair.
    pub fn get_locked_balance(env: Env, user: Address, token: Address) -> i128 {
        let key = DataKey::Vault(user, token);
        env.storage()
            .persistent()
            .get::<_, VaultEntry>(&key)
            .map(|e| e.locked_amount)
            .unwrap_or(0)
    }

    /// Returns the current payment state as u32.
    pub fn get_payment_state(env: Env, user: Address, token: Address) -> u32 {
        let key = DataKey::Vault(user, token);
        env.storage()
            .persistent()
            .get::<_, VaultEntry>(&key)
            .map(|e| e.state)
            .unwrap_or(PaymentState::Created as u32)
    }

    // ───────────────────────────────────────────────────────────
    //  INTERNAL HELPERS
    // ───────────────────────────────────────────────────────────

    /// Validates that state transitions are legal.
    fn assert_state_transition(from: PaymentState, to: PaymentState) {
        let valid = match (from, to) {
            (PaymentState::Created, PaymentState::Funded) => true,
            (PaymentState::Funded, PaymentState::DueSoon) => true,
            (PaymentState::Funded, PaymentState::Executed) => true,
            (PaymentState::Funded, PaymentState::PendingExecution) => true,
            (PaymentState::DueSoon, PaymentState::PendingExecution) => true,
            (PaymentState::DueSoon, PaymentState::Executed) => true,
            (PaymentState::PendingExecution, PaymentState::Executed) => true,
            (PaymentState::PendingExecution, PaymentState::Failed) => true,
            (PaymentState::Failed, PaymentState::PendingExecution) => true, // retry
            _ => false,
        };
        if !valid {
            panic!("Invalid state transition");
        }
    }

    /// Validates that amount is positive.
    fn validate_amount(amount: i128) {
        if amount <= 0 {
            panic!("Amount must be greater than zero");
        }
    }

    /// Validates that unlock_time is in the future.
    fn validate_time(env: &Env, unlock_time: u64) {
        if unlock_time <= env.ledger().timestamp() {
            panic!("Unlock time must be in the future");
        }
    }
}

#[cfg(test)]
mod test;
