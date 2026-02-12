/**
 * DocsPage — project documentation with architecture, encryption, and usage details.
 * Content sourced from PRD and best-practices docs.
 */
import DocLayout from "./DocLayout";

const TOC = [
    { id: "overview", label: "Overview", level: 2 },
    { id: "architecture", label: "System Architecture", level: 2 },
    { id: "project-structure", label: "Project Structure", level: 3 },
    { id: "tech-stack", label: "Technology Stack", level: 2 },
    { id: "key-operations", label: "Key Lifecycle Operations", level: 2 },
    { id: "key-registration", label: "Key Registration", level: 3 },
    { id: "key-rotation", label: "Key Rotation", level: 3 },
    { id: "key-revocation", label: "Key Revocation", level: 3 },
    { id: "encryption", label: "Encryption Specification", level: 2 },
    { id: "algorithm", label: "Algorithm Details", level: 3 },
    { id: "ipfs-format", label: "IPFS Stored Format", level: 3 },
    { id: "smart-contract", label: "Smart Contract", level: 2 },
    { id: "contract-functions", label: "Contract Functions", level: 3 },
    { id: "contract-events", label: "Events", level: 3 },
    { id: "contract-security", label: "Security Features", level: 3 },
    { id: "getting-started", label: "Getting Started", level: 2 },
    { id: "prerequisites", label: "Prerequisites", level: 3 },
    { id: "setup", label: "Setup", level: 3 },
    { id: "deployment", label: "Smart Contract Deployment", level: 3 },
    { id: "glossary", label: "Glossary", level: 2 },
];

export default function DocsPage({ onBack }) {
    return (
        <DocLayout
            title="Documentation"
            subtitle="Comprehensive guide to the Blockchain Key Management System — architecture, usage, and security model."
            onBack={onBack}
            toc={TOC}
        >

            {/* ── Overview ──────────────────────────────────────────── */}
            <section className="docs-section" id="overview">
                <h2>Overview</h2>
                <p>
                    Blockchain KMS is a decentralized key management system demonstrating a hybrid blockchain architecture.
                    It combines on-chain lifecycle management with off-chain encrypted storage to provide a transparent,
                    auditable, and secure key management workflow.
                </p>
                <div className="docs-highlights">
                    <div className="docs-highlight-card">
                        <span className="docs-highlight-icon">⛓️</span>
                        <h4>On-Chain</h4>
                        <p>Smart contracts manage key lifecycle states and provide immutable audit trails on Ethereum Sepolia.</p>
                    </div>
                    <div className="docs-highlight-card">
                        <span className="docs-highlight-icon">📦</span>
                        <h4>Off-Chain</h4>
                        <p>Encrypted key material is stored on IPFS via Pinata, ensuring decentralized and content-addressed storage.</p>
                    </div>
                    <div className="docs-highlight-card">
                        <span className="docs-highlight-icon">🔐</span>
                        <h4>Client-Side</h4>
                        <p>Browser-based AES-256-GCM encryption ensures keys are never exposed in plaintext outside your device.</p>
                    </div>
                </div>
            </section>

            {/* ── Architecture ──────────────────────────────────────── */}
            <section className="docs-section" id="architecture">
                <h2>System Architecture</h2>
                <p>
                    The system follows the <strong>MVVM (Model-View-ViewModel)</strong> pattern with clean architecture
                    principles, separating concerns across distinct layers.
                </p>
                <div className="docs-arch-diagram">
                    <pre>{`┌──────────────────────────────────────────────────────┐
│            Frontend (React MVVM)                     │
│  • Wallet Connection (MetaMask)                      │
│  • Key Dashboard (List, Register, Rotate, Revoke)    │
│  • Encryption Module (AES-256-GCM)                   │
│  • Encrypt/Decrypt Playground                        │
└────────────┬─────────────────────────────────────────┘
             │
             ├──────────────────┐
             ↓                  ↓
┌─────────────────────┐  ┌──────────────────────┐
│  Ethereum Sepolia   │  │   IPFS (Pinata)      │
│  Smart Contract     │  │   Encrypted Blobs    │
│  • KeyRegistry      │  │   • {encrypted_key}  │
│  • Events / Logs    │  │   • CID pointers     │
└─────────────────────┘  └──────────────────────┘`}</pre>
                </div>

                <h3 id="project-structure">Project Structure</h3>
                <div className="docs-code-block">
                    <pre>{`src/
├── models/            # Data classes (KeyModel.js)
├── viewmodels/        # Business logic (useKeyLifecycle.js)
├── services/          # External APIs
│   ├── KeyLifecycleService.js   # Smart contract interaction
│   ├── IPFSService.js           # Pinata IPFS uploads
│   └── EncryptionService.js     # AES-256-GCM encryption
├── views/             # UI components
│   ├── Dashboard.jsx
│   ├── RegisterKeyModal.jsx
│   ├── KeyDetailView.jsx
│   └── EncryptDecryptPlayground.jsx
├── constants/         # Config, ABI, contract address
└── App.jsx            # Root component with routing`}</pre>
                </div>
            </section>

            {/* ── Technology Stack ──────────────────────────────────── */}
            <section className="docs-section" id="tech-stack">
                <h2>Technology Stack</h2>
                <div className="docs-table-wrapper">
                    <table className="docs-table">
                        <thead>
                            <tr>
                                <th>Layer</th>
                                <th>Technology</th>
                                <th>Purpose</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Blockchain</td><td>Ethereum Sepolia Testnet</td><td>Free, stable testnet for on-chain lifecycle</td></tr>
                            <tr><td>Smart Contracts</td><td>Solidity 0.8.20+</td><td>Key lifecycle management with access control</td></tr>
                            <tr><td>Framework</td><td>Hardhat</td><td>Compilation, testing, and deployment</td></tr>
                            <tr><td>Frontend</td><td>React 18+</td><td>MVVM component architecture</td></tr>
                            <tr><td>Web3 Library</td><td>Ethers.js v6</td><td>Wallet and contract interaction</td></tr>
                            <tr><td>Wallet</td><td>MetaMask</td><td>User authentication and transaction signing</td></tr>
                            <tr><td>Storage</td><td>IPFS via Pinata</td><td>Decentralized encrypted blob storage</td></tr>
                            <tr><td>Encryption</td><td>Web Crypto API (AES-256-GCM)</td><td>Native browser encryption</td></tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ── Key Operations ────────────────────────────────────── */}
            <section className="docs-section" id="key-operations">
                <h2>Key Lifecycle Operations</h2>

                <div className="docs-operation" id="key-registration">
                    <h3>1. Key Registration</h3>
                    <ol>
                        <li>User enters a <strong>key name</strong> and <strong>password</strong>.</li>
                        <li>A random 256-bit symmetric key is generated in the browser.</li>
                        <li>The key is encrypted using AES-256-GCM with a PBKDF2-derived key (100,000 iterations, SHA-256).</li>
                        <li>The encrypted blob (ciphertext + IV + salt + auth tag) is uploaded to IPFS via Pinata.</li>
                        <li>The smart contract <code>registerKey(keyId, ipfsCID)</code> is called, where <code>keyId = keccak256(keyName)</code>.</li>
                        <li>The contract stores metadata and emits <code>KeyRegistered</code> event.</li>
                        <li>The key appears in the dashboard with state <strong>ACTIVE</strong>.</li>
                    </ol>
                </div>

                <div className="docs-operation" id="key-rotation">
                    <h3>2. Key Rotation</h3>
                    <ol>
                        <li>User selects an existing <strong>ACTIVE</strong> key and provides the password.</li>
                        <li>A new random key is generated and encrypted with the same password.</li>
                        <li>New encrypted blob is uploaded to IPFS, producing a new CID.</li>
                        <li>The contract <code>rotateKey(keyId, newCID)</code> updates the on-chain pointer.</li>
                        <li>Event <code>KeyRotated</code> is emitted and the <code>rotatedAt</code> timestamp is updated.</li>
                    </ol>
                </div>

                <div className="docs-operation" id="key-revocation">
                    <h3>3. Key Revocation</h3>
                    <ol>
                        <li>User clicks <strong>Revoke</strong> on an ACTIVE key.</li>
                        <li>The contract <code>revokeKey(keyId)</code> sets the state to <strong>REVOKED</strong>.</li>
                        <li>Event <code>KeyRevoked</code> is emitted.</li>
                        <li>All further rotation or operations on this key are disabled.</li>
                    </ol>
                </div>
            </section>

            {/* ── Encryption ────────────────────────────────────────── */}
            <section className="docs-section" id="encryption">
                <h2>Encryption Specification</h2>
                <p>
                    All encryption happens entirely in the browser using the <strong>Web Crypto API</strong>.
                    No plaintext key material ever leaves the user's device.
                </p>

                <h3 id="algorithm">Algorithm Details</h3>
                <div className="docs-table-wrapper">
                    <table className="docs-table">
                        <tbody>
                            <tr><td><strong>Cipher</strong></td><td>AES-256-GCM (Galois/Counter Mode)</td></tr>
                            <tr><td><strong>Key Derivation</strong></td><td>PBKDF2 with SHA-256</td></tr>
                            <tr><td><strong>Iterations</strong></td><td>100,000</td></tr>
                            <tr><td><strong>Salt</strong></td><td>Random 16 bytes (stored with ciphertext)</td></tr>
                            <tr><td><strong>IV</strong></td><td>Random 12 bytes per encryption</td></tr>
                            <tr><td><strong>Auth Tag</strong></td><td>128-bit GCM authentication tag</td></tr>
                        </tbody>
                    </table>
                </div>

                <h3 id="ipfs-format">IPFS Stored Format</h3>
                <div className="docs-code-block">
                    <pre>{`{
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
}`}</pre>
                </div>
            </section>

            {/* ── Smart Contract ─────────────────────────────────────── */}
            <section className="docs-section" id="smart-contract">
                <h2>Smart Contract</h2>
                <p>
                    The <strong>KeyLifecycleManager</strong> contract is deployed on Ethereum Sepolia and manages
                    the full lifecycle of encryption keys.
                </p>

                <h3 id="contract-functions">Contract Functions</h3>
                <div className="docs-table-wrapper">
                    <table className="docs-table">
                        <thead>
                            <tr>
                                <th>Function</th>
                                <th>Access</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td><code>registerKey(keyId, ipfsCID)</code></td><td>External</td><td>Register a new key with IPFS pointer</td></tr>
                            <tr><td><code>rotateKey(keyId, newCID)</code></td><td>Owner only</td><td>Update key's IPFS pointer with new encrypted data</td></tr>
                            <tr><td><code>revokeKey(keyId)</code></td><td>Owner only</td><td>Mark key as REVOKED, disabling all operations</td></tr>
                            <tr><td><code>getKeyMetadata(keyId)</code></td><td>View</td><td>Retrieve key metadata (CID, state, timestamps)</td></tr>
                        </tbody>
                    </table>
                </div>

                <h3 id="contract-events">Events</h3>
                <div className="docs-code-block">
                    <pre>{`event KeyRegistered(bytes32 indexed keyId, string ipfsCID, address indexed owner, uint256 timestamp);
event KeyRotated(bytes32 indexed keyId, string newIpfsCID, uint256 timestamp);
event KeyRevoked(bytes32 indexed keyId, address indexed owner, uint256 timestamp);`}</pre>
                </div>

                <h3 id="contract-security">Security Features</h3>
                <ul className="docs-list">
                    <li>OpenZeppelin's <strong>ReentrancyGuard</strong> for state-changing operations</li>
                    <li><strong>Checks-Effects-Interactions</strong> pattern throughout</li>
                    <li>Custom errors for gas efficiency (<code>KeyNotExists</code>, <code>Unauthorized</code>)</li>
                    <li>Access control: only key owner can rotate or revoke their keys</li>
                    <li>Duplicate key ID prevention</li>
                </ul>
            </section>

            {/* ── Getting Started ────────────────────────────────────── */}
            <section className="docs-section" id="getting-started">
                <h2>Getting Started</h2>

                <h3 id="prerequisites">Prerequisites</h3>
                <ul className="docs-list">
                    <li>Node.js 18+ installed</li>
                    <li>MetaMask browser extension</li>
                    <li>Sepolia test ETH (from a faucet)</li>
                </ul>

                <h3 id="setup">Setup</h3>
                <div className="docs-code-block">
                    <pre>{`# Clone the repository
git clone https://github.com/dormeneur/Key-Management-System-Blockchain.git
cd Key-Management-System-Blockchain

# Install root dependencies (Hardhat)
npm install

# Install frontend dependencies
cd frontend
npm install

# Start the frontend
npm run dev`}</pre>
                </div>

                <h3 id="deployment">Smart Contract Deployment</h3>
                <div className="docs-code-block">
                    <pre>{`# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia`}</pre>
                </div>
            </section>

            {/* ── Glossary ──────────────────────────────────────────── */}
            <section className="docs-section" id="glossary">
                <h2>Glossary</h2>
                <div className="docs-table-wrapper">
                    <table className="docs-table">
                        <tbody>
                            <tr><td><strong>KMS</strong></td><td>Key Management System — software for managing cryptographic keys</td></tr>
                            <tr><td><strong>IPFS</strong></td><td>InterPlanetary File System — peer-to-peer distributed file storage</td></tr>
                            <tr><td><strong>CID</strong></td><td>Content Identifier — cryptographic hash used as an IPFS address</td></tr>
                            <tr><td><strong>AES-GCM</strong></td><td>Advanced Encryption Standard in Galois/Counter Mode — authenticated encryption</td></tr>
                            <tr><td><strong>PBKDF2</strong></td><td>Password-Based Key Derivation Function 2 — derives encryption keys from passwords</td></tr>
                            <tr><td><strong>Sepolia</strong></td><td>Ethereum test network used for development and testing</td></tr>
                            <tr><td><strong>MVVM</strong></td><td>Model-View-ViewModel — architecture pattern separating UI from business logic</td></tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </DocLayout>
    );
}
