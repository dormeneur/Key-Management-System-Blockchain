# 🔐 Blockchain KMS

A decentralized Key Management System built as a Cryptography & Network Security college project. Uses Ethereum smart contracts for lifecycle management, IPFS for encrypted storage, and browser-side AES-256-GCM encryption.

> 🌐 **Live App**: [key-management-system-blockchain.vercel.app](https://key-management-system-blockchain.vercel.app/)
>
> 📜 **Verified Contract**: [View on Etherscan](https://sepolia.etherscan.io/address/0x5D62127C6307C05ca7E9dfC7d45f5d460921a3B9#code)

## Architecture

```
Browser (React MVVM)
├── AES-256-GCM encryption (Web Crypto API)
├── IPFS upload/fetch (Pinata)
└── Smart contract calls (ethers.js + MetaMask)
        │
        ├── Ethereum Sepolia ──► KeyLifecycleManager.sol
        │                         • registerKey / rotateKey / revokeKey
        │                         • Events → immutable audit trail
        └── IPFS (Pinata) ──────► Encrypted key blobs
```

## Prerequisites

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **MetaMask** — browser extension with a Sepolia wallet
- **Sepolia ETH** — from [sepoliafaucet.com](https://sepoliafaucet.com)
- **Alchemy account** — free Sepolia RPC URL
- **Pinata account** — free IPFS API JWT
- **Etherscan API key** — for contract verification

## Quick Start

### 1. Install dependencies

```bash
# Root (smart contracts)
npm install

# Frontend
cd frontend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your keys (see .env.example for details)
```

### 3. Compile & test smart contract

```bash
npx hardhat compile
npx hardhat test
```

### 4. Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

This writes the contract address and ABI to `frontend/src/constants/`.

### 5. Run the frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), connect MetaMask, and start managing keys!

## Features

| Feature | Description |
|---------|-------------|
| **Register Key** | Generate → encrypt → upload to IPFS → on-chain record |
| **Rotate Key** | New encrypted key → new IPFS CID → on-chain update |
| **Revoke Key** | Irreversible on-chain state change |
| **Audit Trail** | Event timeline from blockchain (Etherscan links) |

## Project Structure

```
blockchain-kms/
├── contracts/
│   └── KeyLifecycleManager.sol    # Solidity smart contract
├── test/
│   └── KeyLifecycleManager.test.js# Hardhat tests
├── scripts/
│   └── deploy.js                  # Deployment + ABI export
├── frontend/
│   └── src/
│       ├── models/                # Data classes
│       ├── viewmodels/            # Business logic (useReducer)
│       ├── services/              # Encryption, IPFS, Web3
│       ├── views/                 # React UI components
│       └── constants/             # ABI, address, config
├── hardhat.config.js
├── .env.example
└── README.md
```

## Tech Stack

- **Solidity 0.8.20** + OpenZeppelin
- **Hardhat** — compile, test, deploy
- **React 18** + Vite — MVVM frontend
- **ethers.js v6** — blockchain interaction
- **Web Crypto API** — AES-256-GCM encryption
- **Pinata** — IPFS uploads (free tier)
- **Sepolia Testnet** — zero-cost deployment

## License

MIT
