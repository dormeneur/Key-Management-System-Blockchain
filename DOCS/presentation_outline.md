# Blockchain KMS — Final Presentation Outline

## Slide 1: Title Slide
- **Project Title**: Blockchain-Based Key Management System
- **Subtitle**: Decentralized, Zero-Knowledge Key Lifecycle Management
- **Team**: [Your Name/Team Name]
- **Course**: Cryptography and Network Security

## Slide 2: The Problem
- **Centralized Risks**: Traditional KMS (AWS, Azure) has single points of failure.
- **Insider Threats**: Admins can theoretically access keys.
- **Audit Gaps**: Logs can be tampered with by server owners.
- **Trust**: Users must blindly trust the service provider.

## Slide 3: Our Solution
- **Decentralized Architecture**: No central server stores keys or logs.
- **Zero-Knowledge**: Plaintext keys **never** leave the user's browser.
- **Immutable Audit Trail**: Every action (Register, Rotate, Revoke) is on Ethereum.
- **Encrypted Storage**: IPFS stores only encrypted blobs; Blockchain stores metadata.

## Slide 4: System Architecture (Diagram)
- **Frontend**: React + Web Crypto API (Client-side encryption).
- **Storage**: IPFS (Encrypted Key Blobs).
- **Registry**: Ethereum Smart Contract (Ownership & State).
- *[Visual: Browser <-> IPFS <-> Blockchain triangle]*

## Slide 5: Cryptography Stack
- **Encryption**: AES-256-GCM (Authenticated Encryption).
- **Key Derivation**: PBKDF2 (100k iterations) to secure passwords.
- **Hashing**: Keccak-256 for Key IDs.
- **Signatures**: ECDSA via MetaMask for all transactions.

## Slide 6: Key Features (The "Wow" Factors)
- **Dashboard**: Real-time view of all key states.
- **Audit Trail**: Direct Etherscan links for every transaction.
- **Playground (New!)**:
  - Select any active key.
  - Unlock it with your password.
  - **Actually encrypt/decrypt** messages in real-time.
  - Proves the keys are real and usable.

## Slide 7: Live Demo Flow
1. **Connect Wallet**: Login with MetaMask.
2. **Register Key**: Create "DemoKey", sign transaction.
3. **Verify**: Show the "KeyRegistered" event on Etherscan.
4. **Playground**:
   - Unlock "DemoKey".
   - Encrypt "Hello World".
   - Show ciphertext (shimmer animation).
   - Decrypt back to plaintext.

## Slide 8: Security Analysis
- **Confidentiality**: Strong AES-256 encryption.
- **Integrity**: GCM Auth Tags + IPFS Content Addressing (CID).
- **Non-Repudiation**: Blockchain signatures.
- **Availability**: IPFS + Blockchain are distributed networks.

## Slide 9: Tech Stack
- **Frontend**: React, Vite, Tailwind/CSS.
- **Blockchain**: Solidity, Hardhat, Ethers.js.
- **Network**: Sepolia Testnet, Pinata IPFS.

## Slide 10: Conclusion & Future Scope
- **Achievement**: Built a functional, secure, trustless KMS.
- **Future**: Shared keys (Team access), Hardware wallet integration.
- **Closing**: "Own your keys, own your security."

## Q&A
