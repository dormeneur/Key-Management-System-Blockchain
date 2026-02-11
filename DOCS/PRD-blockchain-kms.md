# Product Requirements Document (PRD)
## Blockchain-Based Key Management System (KMS)

**Project Type**: Academic / College Project  
**Timeline**: 4 Weeks  
**Team Size**: 1-3 Members  
**Budget**: $0 (Free Tier Only)  
**Version**: 1.0 MVP  
**Date**: February 11, 2026

---

## 1. Executive Summary

### 1.1 Project Overview
A decentralized key management system demonstrating hybrid blockchain architecture where:
- **On-chain**: Smart contracts manage key lifecycle states and provide immutable audit trails
- **Off-chain**: Encrypted key material stored on IPFS
- **Client-side**: Browser-based encryption ensures keys never exposed in plaintext

### 1.2 Problem Statement
Traditional centralized Key Management Systems (KMS) suffer from:
- Single point of failure
- Limited auditability
- Trust dependency on central authority
- Vendor lock-in

### 1.3 Solution
A proof-of-concept blockchain KMS leveraging:
- Ethereum smart contracts for lifecycle management (register, rotate, revoke)
- IPFS for distributed encrypted storage
- Client-side AES-256-GCM encryption
- Sepolia testnet for zero-cost deployment

### 1.4 Success Criteria
- ✅ Working end-to-end demo (register → rotate → revoke)
- ✅ Deployed smart contract on Sepolia testnet
- ✅ Encrypted data on IPFS
- ✅ Immutable audit trail visible on Etherscan
- ✅ Complete documentation and presentation

---

## 2. Scope Definition

### 2.1 MVP Features (Must Have)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Key Registration** | Generate random key, encrypt, upload to IPFS, store metadata on-chain | P0 |
| **Key Rotation** | Replace old key with new encrypted key, update on-chain pointer | P0 |
| **Key Revocation** | Mark key as REVOKED, prevent further operations | P0 |
| **Audit Trail** | View lifecycle events from blockchain (registered, rotated, revoked) | P0 |
| **Wallet Connection** | MetaMask integration for Sepolia testnet | P0 |
| **Key List Dashboard** | Display all user's keys with state and timestamps | P0 |

### 2.2 Out of Scope (Future Work)

| Feature | Reason Excluded |
|---------|----------------|
| Proxy Re-Encryption (PRE) | Complex, not essential for concept demonstration |
| Multi-signature Access | Advanced feature, adds significant complexity |
| Automated Rotation Policies | Requires backend scheduler, time-based triggers |
| Mobile Responsive UI | Desktop-first for demo sufficiency |
| TEE/HSM Integration | Enterprise-grade, not college-level requirement |
| Multi-chain Deployment | Single testnet sufficient for MVP |
| Production Security Audit | Not required for academic project |

---

## 3. Technical Architecture

### 3.1 System Components

```
┌──────────────────────────────────────────────────┐
│         Frontend (React MVVM)                    │
│  • Wallet Connection (MetaMask)                  │
│  • Key Dashboard (List, Register, Rotate)        │
│  • Encryption Module (AES-256-GCM)               │
└────────────┬─────────────────────────────────────┘
             │
             ├──────────────────┐
             ↓                  ↓
┌─────────────────────┐  ┌──────────────────────┐
│  Ethereum Sepolia   │  │   IPFS (Pinata)      │
│  Smart Contract     │  │   Encrypted Blobs    │
│  • KeyRegistry      │  │   • {encrypted_key}  │
│  • Events/Logs      │  │   • CID pointers     │
└─────────────────────┘  └──────────────────────┘
```

### 3.2 Architecture Pattern
**MVVM (Model-View-ViewModel)** - See `best-practices.md` Section 2 for implementation details.

### 3.3 Technology Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Blockchain** | Ethereum Sepolia Testnet | Free, stable, well-documented |
| **Smart Contracts** | Solidity 0.8.20+ | Industry standard, Hardhat compatible |
| **Development Framework** | Hardhat | Best tooling, easy testing/deployment |
| **Frontend** | React 18+ | MVVM implementation, component reusability |
| **Web3 Library** | Ethers.js v6 | Lightweight, well-maintained |
| **Wallet** | MetaMask | Most popular, easy integration |
| **Off-chain Storage** | IPFS via Pinata | Free tier (1GB), simple API |
| **Encryption** | Web Crypto API (AES-256-GCM) | Native browser support, secure |
| **RPC Provider** | Alchemy Free / FreeRPC | No credit card, sufficient quota |

---

## 4. Functional Requirements

### 4.1 User Stories

#### US-001: Key Registration
**As a** user  
**I want to** register a new encryption key  
**So that** I can securely manage it with blockchain auditability

**Acceptance Criteria**:
- User enters key name and password
- System generates random 256-bit key
- Key encrypted with password-derived key (PBKDF2)
- Encrypted blob uploaded to IPFS → returns CID
- Smart contract `registerKey(keyId, ipfsCID)` called
- Transaction confirmed on Sepolia
- Event `KeyRegistered` emitted with keyId, CID, timestamp
- Key appears in user dashboard with state "ACTIVE"

#### US-002: Key Rotation
**As a** user  
**I want to** rotate an existing key  
**So that** I can update compromised or expired keys

**Acceptance Criteria**:
- User selects ACTIVE key from dashboard
- System generates new random key
- New key encrypted with same password
- New encrypted blob uploaded to IPFS → new CID
- Smart contract `rotateKey(keyId, newCID)` called
- Old CID replaced with new CID on-chain
- Event `KeyRotated` emitted
- Timestamp `rotatedAt` updated

#### US-003: Key Revocation
**As a** user  
**I want to** revoke a key  
**So that** it cannot be used anymore

**Acceptance Criteria**:
- User clicks "Revoke" on ACTIVE key
- Smart contract `revokeKey(keyId)` called
- Key state changed to REVOKED on-chain
- Event `KeyRevoked` emitted
- Key shows "REVOKED" status in dashboard
- Further rotation/operations disabled

#### US-004: Audit Trail Viewing
**As a** user  
**I want to** view complete lifecycle history  
**So that** I can audit all key operations

**Acceptance Criteria**:
- Dashboard shows timeline per key:
  - Registered at [timestamp]
  - Rotated at [timestamp] (if applicable)
  - Revoked at [timestamp] (if applicable)
- Events fetched from smart contract
- Etherscan link provided for on-chain verification

---

## 5. Smart Contract Specification

### 5.1 Contract: KeyLifecycleManager.sol

**State Variables**:
```solidity
enum KeyState { ACTIVE, REVOKED }

struct KeyMetadata {
    string ipfsCID;
    KeyState state;
    uint256 registeredAt;
    uint256 rotatedAt;
    address owner;
}

mapping(bytes32 => KeyMetadata) private _keys;
```

**Functions** (See `best-practices.md` Section 3 for implementation):

| Function | Access | Description |
|----------|--------|-------------|
| `registerKey(bytes32 keyId, string ipfsCID)` | External | Register new key with IPFS pointer |
| `rotateKey(bytes32 keyId, string newCID)` | External, onlyKeyOwner | Update key's IPFS pointer |
| `revokeKey(bytes32 keyId)` | External, onlyKeyOwner | Mark key as REVOKED |
| `getKeyMetadata(bytes32 keyId)` | External view | Retrieve key metadata |

**Events**:
```solidity
event KeyRegistered(bytes32 indexed keyId, string ipfsCID, address indexed owner, uint256 timestamp);
event KeyRotated(bytes32 indexed keyId, string newIpfsCID, uint256 timestamp);
event KeyRevoked(bytes32 indexed keyId, address indexed owner, uint256 timestamp);
```

**Security Requirements** (See `best-practices.md` Section 3):
- OpenZeppelin's `Ownable` for admin functions
- `ReentrancyGuard` for state-changing operations
- Custom errors for gas efficiency
- Access control: only key owner can rotate/revoke

### 5.2 Testing Requirements
- **Unit tests**: 100% function coverage
- **Test scenarios**:
  - ✅ Register new key successfully
  - ✅ Prevent duplicate keyId registration
  - ✅ Only owner can rotate/revoke
  - ✅ Cannot operate on non-existent key
  - ✅ Events emit correctly with proper parameters

---

## 6. Frontend Specification

### 6.1 Pages/Views

#### 6.1.1 Landing Page
- Connect Wallet button
- Project title and brief description
- Network indicator (Sepolia)

#### 6.1.2 Dashboard (Main View)
**Components**:
- **Header**: Wallet address, balance, disconnect button
- **Key List Table**:
  - Columns: Key Name, State, Registered, Last Rotated, Actions
  - Actions: View Details, Rotate (if ACTIVE), Revoke (if ACTIVE)
- **Register New Key Button**: Opens modal/form

#### 6.1.3 Register Key Modal
**Form Fields**:
- Key Name (text input, required)
- Password (password input, required, min 8 chars)
- Confirm Password (must match)
- Submit button: "Register Key"

**Flow**:
1. Validate inputs
2. Generate random 256-bit key
3. Show loading: "Encrypting and uploading..."
4. Upload to IPFS
5. Show loading: "Confirming transaction..."
6. Call smart contract
7. Success message with Etherscan link
8. Refresh dashboard

#### 6.1.4 Key Detail View
- Key metadata display
- IPFS CID with gateway link
- Event timeline (visual)
- Action buttons: Rotate, Revoke
- Back to dashboard

### 6.2 MVVM Implementation
**Follow `best-practices.md` Section 2 and 4**:

```
models/
  KeyModel.js          # Data structures
viewmodels/
  KeyLifecycleViewModel.js  # Business logic
services/
  KeyLifecycleService.js    # Contract interaction
  IPFSService.js            # Pinata API
  EncryptionService.js      # AES-256-GCM
views/
  Dashboard.jsx
  RegisterKeyModal.jsx
  KeyDetailView.jsx
```

---

## 7. Encryption Specification

### 7.1 Encryption Algorithm
**AES-256-GCM** (Galois/Counter Mode)

**Key Derivation**:
- Algorithm: PBKDF2
- Iterations: 100,000
- Hash: SHA-256
- Salt: Random 16 bytes (stored with ciphertext)

### 7.2 Data Format (IPFS Stored)
```json
{
  "version": "1.0",
  "algorithm": "AES-256-GCM",
  "ciphertext": "<base64_encrypted_key>",
  "iv": "<base64_initialization_vector>",
  "salt": "<base64_salt>",
  "authTag": "<base64_auth_tag>",
  "metadata": {
    "createdAt": 1707627360,
    "keyType": "symmetric"
  }
}
```

### 7.3 Implementation (See `best-practices.md` Section 4)
```javascript
// utils/EncryptionService.js
class EncryptionService {
  async encryptKey(keyData, password) { /* ... */ }
  async decryptKey(encryptedBlob, password) { /* ... */ }
}
```

---

## 8. Development Timeline

### 8.1 Sprint Breakdown (4 Weeks)

| Week | Focus | Deliverables | Status |
|------|-------|--------------|--------|
| **Week 1** | Smart Contract | Contract code, tests, Sepolia deployment | Refer `best-practices.md` Section 9 |
| **Week 2** | Encryption & IPFS | Encryption module, IPFS integration, tests | |
| **Week 3** | Frontend | React app, MVVM structure, wallet connect, full integration | |
| **Week 4** | Polish & Docs | Bug fixes, report writing, demo prep, presentation | |

### 8.2 Daily Workflow
**Follow `best-practices.md` Section 7 for daily routine**:
- Morning: Pull latest, compile contracts, start frontend
- Development: Follow MVVM pattern strictly
- Testing: Run tests before each commit
- Evening: Commit working features, update progress

---

## 9. Testing Strategy

### 9.1 Smart Contract Testing
**Framework**: Hardhat + Ethers.js

**Test Coverage Requirements**:
- Line coverage: 100%
- Branch coverage: 100%
- Function coverage: 100%

**Test Files**:
```
test/
  KeyLifecycleManager.test.js
    • Register tests (valid, duplicate, events)
    • Rotate tests (owner, non-owner, state checks)
    • Revoke tests (permissions, state transitions)
```

### 9.2 Integration Testing
**Manual Test Checklist** (See `best-practices.md` Section 8):
- [ ] Wallet connects to Sepolia
- [ ] Register key end-to-end works
- [ ] IPFS upload successful
- [ ] Transaction confirms on Etherscan
- [ ] Event appears in dashboard
- [ ] Rotate key updates CID
- [ ] Revoke changes state
- [ ] No console errors

---

## 10. Deployment Specification

### 10.1 Smart Contract Deployment

**Network**: Ethereum Sepolia Testnet

**Pre-deployment Checklist**:
- [ ] All tests passing
- [ ] Sepolia ETH in wallet (from faucet)
- [ ] Hardhat config updated with Sepolia RPC
- [ ] Etherscan API key configured

**Deployment Steps**:
```bash
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network sepolia
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

**Post-deployment**:
- Save contract address
- Save deployment transaction hash
- Screenshot Etherscan contract page
- Update frontend with contract address

### 10.2 Frontend Deployment

**Platform**: GitHub Pages / Vercel (Free)

**Build Process**:
```bash
cd frontend
yarn build
yarn deploy  # or push to gh-pages branch
```

**Environment Variables**:
```
REACT_APP_CONTRACT_ADDRESS=0x...
REACT_APP_SEPOLIA_RPC_URL=https://...
REACT_APP_PINATA_JWT=...
```

---

## 11. Documentation Requirements

### 11.1 Code Documentation
- All functions must have JSDoc comments
- Smart contract functions: NatSpec format
- README.md with setup instructions

### 11.2 Project Report (10-15 Pages)

**Structure** (See `best-practices.md` Section 12):
1. **Abstract** (150 words)
2. **Introduction**
   - Problem statement
   - Motivation for blockchain KMS
3. **Related Work**
   - Centralized KMS (AWS KMS, Azure)
   - NuCypher KMS (proxy re-encryption)
   - Comparison table
4. **System Design**
   - Architecture diagram
   - MVVM pattern explanation
   - Data flow diagrams
5. **Implementation**
   - Tech stack justification
   - Smart contract design
   - Encryption approach
   - Code snippets with explanations
6. **Demo & Results**
   - Screenshots of UI
   - Etherscan transaction links
   - IPFS gateway links
   - Event logs
7. **Security Analysis**
   - Threat model
   - Mitigation strategies
   - Known limitations
8. **Limitations & Future Work**
   - PRE for key sharing
   - Automated rotation policies
   - Multi-chain support
9. **Conclusion**
10. **References**

### 11.3 Presentation (10 Slides)
1. Title + Team
2. Problem Statement
3. Proposed Solution
4. System Architecture
5. Key Features
6. Live Demo (or video)
7. Technical Highlights
8. Security Considerations
9. Limitations & Future Work
10. Q&A

---

## 12. Risk Management

### 12.1 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Smart contract bug | High | 100% test coverage, code review |
| IPFS upload failure | Medium | Retry logic, error handling |
| MetaMask transaction rejection | Low | Clear user instructions, gas estimation |
| Sepolia RPC downtime | Medium | Use multiple RPC providers (Alchemy + FreeRPC) |
| Browser encryption compatibility | Low | Use Web Crypto API (widely supported) |

### 12.2 Timeline Risks

| Risk | Mitigation |
|------|------------|
| Smart contract delays | Start Week 1 Day 1, simplest design first |
| IPFS integration complexity | Use Pinata SDK, test early |
| React learning curve | Follow MVVM template strictly |
| Last-minute bugs | Weekly demo-ready state (see `best-practices.md` Section 8) |

---

## 13. Success Metrics

### 13.1 Functional Metrics
- ✅ Smart contract deployed and verified on Sepolia
- ✅ At least 5 successful key registrations in demo
- ✅ All 3 operations working (register, rotate, revoke)
- ✅ Events visible on Etherscan
- ✅ IPFS content retrievable via gateway

### 13.2 Code Quality Metrics
- ✅ Smart contract test coverage: 100%
- ✅ No critical/high security warnings from Slither
- ✅ Zero console errors in frontend
- ✅ Clean Git history with meaningful commits

### 13.3 Academic Metrics
- ✅ Report: 10-15 pages with diagrams
- ✅ Demo video: 5-7 minutes
- ✅ Presentation: 10 slides, 8-10 minute delivery
- ✅ Code repository: Well-structured, documented README

---

## 14. Dependencies & Resources

### 14.1 External Services (All Free Tier)

| Service | Plan | Limits | Sign-up Link |
|---------|------|--------|--------------|
| **Alchemy** | Free | 300M compute units/month | https://www.alchemy.com/ |
| **Pinata** | Free | 1 GB storage, 500 files | https://www.pinata.cloud/ |
| **Sepolia Faucet** | Free | Test ETH | https://sepoliafaucet.com/ |
| **Etherscan** | Free | API for verification | https://etherscan.io/ |

### 14.2 Development Tools

**Install Once** (See `best-practices.md` Section 10):
```bash
# Node.js 18+
# Yarn package manager
npm install -g yarn

# Hardhat
yarn add --dev hardhat

# Security tools
pip install slither-analyzer

# Solhint (linter)
npm install -g solhint
```

---

## 15. Acceptance Criteria (Demo Day)

### 15.1 Live Demo Checklist
- [ ] Laptop charged, backup device ready
- [ ] MetaMask configured with Sepolia
- [ ] Wallet has test ETH (1-2 ETH buffer)
- [ ] Frontend running locally (not relying on deployment)
- [ ] Contract address copied, Etherscan tab open
- [ ] Demo script practiced 3+ times
- [ ] Screenshots/backup video ready

### 15.2 Demo Flow (5 Minutes)
1. **Introduction** (30s): Brief problem statement
2. **Architecture** (30s): Show diagram, explain hybrid model
3. **Register Key** (90s):
   - Enter key name and password
   - Show "encrypting" → "uploading to IPFS"
   - Approve MetaMask transaction
   - Show success + Etherscan link
4. **View Dashboard** (30s): Key appears with ACTIVE state
5. **Rotate Key** (60s): Click rotate, new transaction, updated CID
6. **Revoke Key** (30s): Click revoke, state changes to REVOKED
7. **Audit Trail** (30s): Show event timeline, Etherscan events
8. **Q&A Buffer** (30s)

---

## 16. Post-MVP Roadmap (Future Enhancements)

### 16.1 Version 1.1 (Post-Submission)
- Automated rotation policies (time-based)
- Key sharing with access control
- Mobile-responsive UI
- React testing library integration

### 16.2 Version 2.0 (Research Extension)
- Proxy re-encryption (NuCypher/Lit Protocol)
- Threshold signatures for multi-party control
- TEE integration (Intel SGX)
- Multi-chain deployment (Polygon, Arbitrum)

### 16.3 Production Considerations
- Professional security audit
- FIPS 140-2 compliance documentation
- GDPR compliance framework
- Enterprise HSM integration

---

## 17. References & Resources

### 17.1 Academic Papers
1. NuCypher KMS: Decentralized key management system (2017)
2. Blockchain-based Key Management for the Internet of Things (2019)
3. Proxy Re-Encryption Schemes (Cryptography literature)

### 17.2 Technical Documentation
- Ethereum Documentation: https://ethereum.org/developers
- Solidity Docs: https://docs.soliditylang.org
- Hardhat: https://hardhat.org/docs
- Ethers.js v6: https://docs.ethers.org/v6
- OpenZeppelin Contracts: https://docs.openzeppelin.com/contracts
- IPFS: https://docs.ipfs.tech

### 17.3 Security Resources
- ConsenSys Smart Contract Best Practices
- SWC Registry (Smart Contract Weaknesses)
- Slither Documentation
- OWASP Blockchain Security

---

## 18. Appendix

### 18.1 Glossary
- **KMS**: Key Management System
- **IPFS**: InterPlanetary File System
- **CID**: Content Identifier (IPFS hash)
- **AES-GCM**: Advanced Encryption Standard - Galois/Counter Mode
- **PBKDF2**: Password-Based Key Derivation Function 2
- **PRE**: Proxy Re-Encryption
- **TEE**: Trusted Execution Environment
- **HSM**: Hardware Security Module

### 18.2 Contact & Support
- GitHub Issues: For technical questions
- Stack Overflow: ethereum, solidity, ipfs tags
- Ethereum Stack Exchange: For blockchain-specific queries

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 11, 2026 | Development Team | Initial PRD for MVP |

**Approval**:
- [ ] Project Guide/Mentor
- [ ] Team Lead
- [ ] Technical Reviewer

---

**END OF DOCUMENT**

**Next Steps**:
1. Review this PRD with team/mentor
2. Setup development environment (follow `best-practices.md` Section 10)
3. Create GitHub repository with folder structure (Section 1)
4. Begin Week 1: Smart contract development
5. Daily standup: Follow `best-practices.md` Section 7

**Questions? Refer to `best-practices.md` for implementation details.**
