# FixBoard — E-Commerce Seller Demand Board

> **Crowdsourced automation for Amazon, Shopify & multi-channel merchants, secured by Ethereum & Solidity smart contracts.**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-3C3C3D?style=for-the-badge&logo=ethereum)](https://sepolia.etherscan.io/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Deploy with Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

---

## 🎯 The Problem

Small and mid-sized e-commerce sellers waste hours every week on repetitive operational chores:
- **Catalog cleanup**: Cross-referencing duplicate SKUs and fragmented UPCs across Amazon Seller Central, Shopify, Walmart, and eBay.
- **Return disputes & inspection**: High return rates with zero pattern detection for supplier defects or buyer remorse.
- **Channel sync delays**: 15–30 minute sync lags causing overselling and stockouts during flash sales.
- **Listing compliance suppression**: Minor bullet-point punctuation or formatting claims triggering sudden Amazon suppression.
- **Carrier dim-weight overcharges**: Unexpected packaging adjustments on weekly carrier invoices.

App stores are crowded with generic, expensive enterprise tools, but there has been **no demand board where sellers post a specific operational chore, rally community votes, and pool funding** so developers can ship the exact fix.

---

## ⚡ The Solution: FixBoard

FixBoard provides a decentralized demand and bounty board for online merchants:
1. **Post a Specific Chore**: Surface operational pain with severity ratings (1–5) and targeted marketplace tags.
2. **Community Voting**: Other sellers facing the exact same friction upvote to validate commercial demand.
3. **Escrow Funding**: Merchants pool pledges to fund the solution.
4. **Decentralized Consensus**: Backed by **Ethereum smart contracts** for tamper-proof voting, transparent escrow, and immutable audit logs.

---

## 🛡️ Ethereum & Solidity Blockchain Layer

FixBoard integrates **Solidity** smart contracts deployed on the **Ethereum Sepolia Testnet** (100% free to use):

- **Cryptographic Keccak-256 Data Hash**: When a chore is posted, its canonical content is hashed and registered on-chain. Any tampering or unauthorized modification is mathematically detectable.
- **1-Wallet-1-Vote Rule**: Votes are signed by Ethereum wallet addresses, preventing artificial bot manipulation and astroturfed demand.
- **Transparent Escrow Pledges**: Sellers can back chores using testnet Sepolia ETH (zero real gas costs).
- **Immutable EVM Audit Trail**: Every registration, vote, vote revocation, pledge, and comment hash is immutably appended to the contract ledger.
- **Zero-Friction Dual-Mode Web3**:
  - **MetaMask / Brave / Coinbase / EIP-1193**: Connects seamlessly with real testnet accounts.
  - **Sepolia Sandbox Demo Wallet**: Instant built-in ephemeral wallet with pre-funded balance for visitors without browser extensions, ensuring zero hurdles for anyone trying the app.

---

## 📂 Project Structure

```
fixboard-next/
├── contracts/
│   ├── FixBoard.sol           # Solidity smart contract (voting, pledging, audit trail)
│   └── FixBoardABI.json       # Contract ABI for ethers.js interaction
├── components/
│   ├── Header.js              # Sticky header with Web3 status & wallet pill
│   ├── ChoreCard.js           # Chore card with Sepolia verified seal
│   ├── ChoreDetailModal.js    # Detail view with on-chain cryptographic proof
│   ├── PledgeModal.js         # Escrow pledge modal (Sepolia ETH & USD)
│   ├── NewChoreModal.js       # Chore creation with on-chain hashing
│   ├── WalletModal.js         # Web3 wallet manager & network switcher
│   └── AuditTrailModal.js     # Filterable EVM audit ledger & Keccak-256 verifier
├── lib/
│   ├── AppContext.js          # Global state (theme, Web3, chores, Firestore sync)
│   ├── firebase.js            # Firebase Cloud Firestore integration
│   └── web3.js                # Ethereum Sepolia & ethers.js provider layer
├── pages/
│   ├── _app.js                # Next.js app wrapper with AppProvider
│   ├── index.js               # Main Demand Board, Leaderboard & Analytics Pulse
│   └── audit.js               # Dedicated standalone EVM Audit Trail page
├── styles/
│   └── globals.css            # Dark/Light mode tokens & glassmorphism styling
├── package.json
└── README.md
```

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ 
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bit-coder91/fixboard.git
   cd fixboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 🌐 Deploy to Vercel (100% Free)

FixBoard is optimized for **1-click deployment on Vercel**:

1. Fork or push this repository to your GitHub account.
2. Visit [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select this repository and click **Deploy**.
4. *(Optional)* Add custom environment variables:
   - `NEXT_PUBLIC_FIXBOARD_CONTRACT_ADDRESS`: `0x83A41b2B54848039e246944B27CFe6cf1A4676cD`
   - `NEXT_PUBLIC_FIREBASE_API_KEY`: *(optional, app automatically falls back to high-performance local mode)*

---

## 📜 Smart Contract Reference

- **Network**: Ethereum Sepolia Testnet (Chain ID `11155111`)
- **Contract Address**: `0x83A41b2B54848039e246944B27CFe6cf1A4676cD`
- **Explorer**: [https://sepolia.etherscan.io](https://sepolia.etherscan.io)
- **Free Faucet**: [https://sepoliafaucet.com](https://sepoliafaucet.com)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
