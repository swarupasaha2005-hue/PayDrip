# PayDrip: Production-Ready Stellar dApp 💜🚀

![Build Status](https://github.com/swarupasaha2005-hue/PayDrip/actions/workflows/ci.yml/badge.svg)

PayDrip is a high-performance, decentralized finance (DeFi) dashboard built for the **Stellar Soroban** ecosystem. It features advanced inter-contract logic, full mobile responsiveness, and automated CI/CD workflows.

---

## 🏗️ System Architecture
For a deep dive into the technical design, data flow, and component breakdown, please refer to our **[Architecture Documentation](./ARCHITECTURE.md)**.

---

## 🌟 MVP Feature Map
1. **Wallet Onboarding**: Instant connection via Freighter with real-time XLM balance hydration.
2. **Time-Locked Vaults**: Securely lock funds for a future date using our `PayVault` smart contract.
3. **Loyalty Rewards**: Automated "Drip Points" minted via inter-contract calls upon successful claims.
4. **Deep Validation**: Integrated balance and date validation to prevent invalid blockchain transactions.
5. **Interactive Activity**: Real-time transaction feed with one-click "Copy Hash" and explorer verification.

---

## 📸 Visual Overview

### 1. Onboarding & Wallet
![Onboarding](/Users/swarupasaha/.gemini/antigravity/brain/21d42ee9-be04-47b1-a8a7-1e52bd7ddc6d/onboarding_page_1776016195918.png)

### 2. Dashboard & Rewards
![Dashboard](/Users/swarupasaha/.gemini/antigravity/brain/21d42ee9-be04-47b1-a8a7-1e52bd7ddc6d/dashboard_page_1776016233059.png)

### 3. Automated CI/CD (GitHub Actions)
![CI Status](/Users/swarupasaha/.gemini/antigravity/brain/21d42ee9-be04-47b1-a8a7-1e52bd7ddc6d/test_results_terminal_1776016583446.png)

---

## ⚙️ DevOps & Local Setup

### 🔄 CI/CD Workflow
The project includes a `.github/workflows/ci.yml` file that automates:
1. **Frontend**: Install -> Lint -> Build (Vite) -> Vitest (Unit Tests).
2. **Blockchain**: Cargo Test (PayVault) -> Cargo Test (DripRewards) -> WASM Build.

### 🚀 Running Locally
```bash
# Frontend
npm install
npm run dev

# Smart Contracts
cd contract/contracts/pay-vault && cargo test
cd contract/contracts/drip-rewards && cargo test
```

---

## 🔗 Contract Architecture

| Contract | Address | Responsibility |
| :--- | :--- | :--- |
| **PayVault** | `CDL52WTKS4YCXTCSMY2MCVJ2O3DPO2ET7EWXJIQMRP75I6O5ILGFDLWU` | Escrow, time-locking, and user deposits. |
| **DripRewards** | `CBPCJ3X... (Deployed on Testnet)` | Inter-contract minting of loyalty rewards. |

---

## 📱 Responsiveness Details
PayDrip uses a custom fluid grid system (`.grid-stack`) that ensures a premium experience across Mobile, Tablet, and Desktop. Touch-friendly components and adaptive navigation allow for seamless management of your time-locked funds on the go.

---

Developed for high-impact Stellar dApp submission. 🚀
