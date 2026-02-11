# Blockchain KMS College Project - **Development Best Practices**

**Architecture**: **MVVM** (Model-View-ViewModel) + **Clean Architecture**  
**Goal**: Modular, testable, maintainable code for a college project. Keep it simple but professional. [alchemy](https://www.alchemy.com/overviews/smart-contract-security-best-practices)

***

## 1. Project Structure (Essential)

```
blockchain-kms-college/
├── contracts/                 # Solidity contracts
│   ├── KeyLifecycleManager.sol
│   └── interfaces/            # ABI interfaces
├── frontend/                  # React MVVM app
│   ├── src/
│   │   ├── models/            # Contract data models
│   │   ├── viewmodels/        # Business logic
│   │   ├── views/             # UI components
│   │   ├── services/          # Web3, IPFS services
│   │   ├── utils/             # Helpers (encryption)
│   │   └── App.jsx
├── hardhat.config.js          # Hardhat config
├── package.json
├── README.md
└── docs/
    └── architecture.md
```

***

## 2. Architecture: MVVM Pattern (Frontend)

### **Model** (`models/KeyModel.js`)
```javascript
// Pure data structures, no logic
export class KeyMetadata {
    constructor(keyId, ipfsCID, state, owner, timestamps) {
        this.keyId = keyId;
        this.ipfsCID = ipfsCID;
        this.state = state; // 0=ACTIVE, 1=REVOKED
        this.owner = owner;
        this.registeredAt = timestamps.registeredAt;
        this.rotatedAt = timestamps.rotatedAt;
    }
}
```

### **ViewModel** (`viewmodels/KeyLifecycleViewModel.js`)
```javascript
// Business logic, no UI
import { KeyLifecycleService } from '../services/KeyLifecycleService';

export class KeyLifecycleViewModel {
    constructor(walletAddress) {
        this.service = new KeyLifecycleService(walletAddress);
        this.keys = [];
    }
    
    async loadUserKeys() {
        this.keys = await this.service.getUserKeys();
        return this.keys;
    }
    
    async registerKey(keyName, encryptedData) {
        const ipfsCID = await this.service.uploadToIPFS(encryptedData);
        const keyId = await this.service.registerKey(keyName, ipfsCID);
        await this.loadUserKeys(); // Refresh
        return keyId;
    }
}
```

### **View** (`views/KeyDashboard.jsx`)
```javascript
// Pure UI, no logic
function KeyDashboard({ viewModel, onRegister, onRotate, onRevoke }) {
    return (
        <div>
            <KeyList keys={viewModel.keys} />
            <RegisterKeyForm onSubmit={onRegister} />
        </div>
    );
}
```

***

## 3. Smart Contract Best Practices

### **Contract Structure**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract KeyLifecycleManager is Ownable, ReentrancyGuard {
    enum KeyState { ACTIVE, REVOKED }
    
    struct KeyMetadata {
        string ipfsCID;
        KeyState state;
        uint256 registeredAt;
        uint256 rotatedAt;
        address owner;
    }
    
    // Events first
    event KeyRegistered(bytes32 indexed keyId, string ipfsCID, address indexed owner);
    event KeyRotated(bytes32 indexed keyId, string newIpfsCID);
    event KeyRevoked(bytes32 indexed keyId);
    
    // State variables
    mapping(bytes32 => KeyMetadata) private _keys;
    
    // Functions: external > public > internal > private
    // Modifier order: onlyOwner > onlyKeyOwner > nonReentrant
}
```

### **Security Checklist**
- ✅ **Use OpenZeppelin** contracts (Ownable, ReentrancyGuard)
- ✅ **Checks-Effects-Interactions** pattern
- ✅ **Custom Errors** instead of strings:
  ```solidity
  error KeyNotExists();
  error Unauthorized();
  ```
- ✅ **Immutable** for constants
- ✅ **Events** for all state changes (audit trail)
- ✅ **Access Control**: `onlyKeyOwner(keyId)` modifier

### **Testing** (100% coverage)
```javascript
// test/KeyLifecycleManager.test.js
describe("KeyLifecycleManager", () => {
    describe("registerKey", () => {
        it("registers new key", async () => { /* test */ });
        it("reverts on duplicate keyId", async () => { /* test */ });
        it("emits correct event", async () => { /* test */ });
    });
});
```

***

## 4. Frontend Architecture (React + MVVM)

### **Service Layer** (`services/KeyLifecycleService.js`)
```javascript
// Single responsibility: blockchain + IPFS communication
export class KeyLifecycleService {
    constructor(walletAddress, contract) {
        this.walletAddress = walletAddress;
        this.contract = contract;
    }
    
    async registerKey(keyName, ipfsCID) {
        const keyId = ethers.keccak256(ethers.toUtf8Bytes(keyName));
        const tx = await this.contract.registerKey(keyId, ipfsCID);
        await tx.wait();
        return keyId;
    }
}
```

### **Folder Structure**
```
src/
├── models/          # Data classes
├── viewmodels/      # Business logic
├── services/        # External APIs (Web3, IPFS)
├── views/           # UI components
├── hooks/           # Custom React hooks
├── utils/           # Pure functions (encryption)
└── constants/       # Config, ABI
```

### **State Management**: **useReducer** (no Redux needed)
```javascript
const initialState = { keys: [], loading: false, error: null };
const reducer = (state, action) => {
    switch (action.type) {
        case 'LOADING': return { ...state, loading: true };
        case 'KEYS_LOADED': return { ...state, keys: action.keys };
        default: return state;
    }
};
```

***

## 5. Code Quality Rules

### **Git Workflow**
```
main          # Production ready
develop       # Integration branch
feature/key-register # Feature branches
hotfix/bug-1  # Bug fixes
```

**Commit messages**:
```
feat: add key registration function
fix: prevent duplicate keyId registration
test: add rotateKey unit tests
docs: update README architecture diagram
```

### **Naming Conventions**
```
Contract: PascalCase (KeyLifecycleManager)
Functions: camelCase (registerKey)
Variables: camelCase (keyMetadata)
Constants: UPPER_SNAKE_CASE (MAX_KEYS_PER_USER)
Events: PascalCase (KeyRegistered)
```

### **File Size Rule**
- **< 200 lines**: OK
- **200-400 lines**: Split into smaller functions
- **> 400 lines**: Split into multiple files

***

## 6. Error Handling Standards

### **Smart Contract**
```solidity
function registerKey(bytes32 keyId, string calldata ipfsCID) external {
    if (_keys[keyId].exists) revert KeyAlreadyExists();
    if (bytes(ipfsCID).length == 0) revert InvalidIpfsCID();
    
    // Effects
    _keys[keyId] = KeyMetadata({ ... });
    
    // Interactions (events)
    emit KeyRegistered(keyId, ipfsCID, msg.sender);
}
```

### **Frontend**
```javascript
async function registerKey() {
    try {
        dispatch({ type: 'LOADING' });
        const result = await viewModel.registerKey(keyName, encryptedData);
        dispatch({ type: 'SUCCESS', result });
    } catch (error) {
        dispatch({ 
            type: 'ERROR', 
            message: error.message || 'Unknown error'
        });
    } finally {
        dispatch({ type: 'IDLE' });
    }
}
```

***

## 7. Development Workflow (Daily Routine)

### **Morning (30 min setup)**
```
1. git pull origin develop
2. yarn install  # or npm install
3. npx hardhat compile
4. yarn start    # Frontend
```

### **Testing Before Commit**
```bash
# 1. Run smart contract tests
npx hardhat test

# 2. Run frontend tests (if you add them)
yarn test

# 3. Lint
yarn lint

# 4. Security scan (once a week)
npx slither contracts/
```

### **Before Push**
```
git checkout develop
git pull origin develop
git checkout feature-branch
git merge develop  # Resolve conflicts
git push origin feature-branch
```

***

## 8. Demo‑Ready Checklist

### **Always Working**
- [ ] Frontend loads without errors
- [ ] Wallet connects to Sepolia
- [ ] Can register a new key (end‑to‑end)
- [ ] Can see registered keys
- [ ] Can revoke a key
- [ ] Etherscan shows events
- [ ] IPFS gateway shows encrypted data

### **Console Clean**
```
✅ No console errors/warnings
✅ No unhandled promises
✅ No deprecated warnings
✅ No prop type warnings
```

***

## 9. Weekly Milestones (4‑week project)

| Week | Deliverable | Success Criteria |
|------|-------------|------------------|
| **1** | Smart contract + tests | Deployed to Sepolia, 100% test coverage |
| **2** | Encryption + IPFS | Can encrypt/decrypt + upload/retrieve |
| **3** | Frontend MVVM | Register flow works end‑to‑end |
| **4** | Polish + demo | Full demo ready, report draft |

***

## 10. Tools Setup (One‑time)

```bash
# 1. Node.js (18+)
# 2. Yarn (preferred over npm)
npm install -g yarn

# 3. Hardhat project
yarn create hardhat

# 4. Frontend
cd frontend
yarn create react-app . --template typescript  # Optional TS
yarn add ethers@6 @rainbow-me/rainbowkit wagmi viem axios

# 5. Security tools
pip install slither-analyzer
npm install -g solhint
```

***

## 11. Common Pitfalls (Avoid These)

| ❌ **Problem** | ✅ **Solution** |
|---------------|----------------|
| "Transaction stuck" | Check Sepolia RPC, increase gas |
| "IPFS not found" | Wait 30s for Pinata pinning |
| "Event not showing" | Use correct ABI, check filters |
| "Key already exists" | Use unique keyId (keccak256(keyName + timestamp)) |
| "Access denied" | Check `msg.sender == owner` logic |

***

## 12. Report Structure Template

```
1. Abstract (150 words)
2. Introduction (Problem + Motivation)
3. Related Work (NuCypher, centralized KMS)
4. System Design (Architecture diagram)
5. Implementation (MVVM, tech stack)
6. Demo Screenshots + Etherscan links
7. Security Analysis (threat model)
8. Limitations & Future Work
9. Conclusion
```

**Include Sepolia contract address** and **IPFS CIDs** as proof.

***

## 13. Pro Tips for College Project Success

1. **Start with contract first** - hardest part, gets you confidence  
2. **Commit every working feature** - creates demo momentum  
3. **Keep console.log() statements** - helps debugging during demo  
4. **Screenshot everything** - Etherscan txs, IPFS gateways, events  
5. **Practice 5‑min demo** 3x before presenting  
6. **Mention limitations honestly** - shows you understand tradeoffs  

***
