/**
 * EncryptDecryptPlayground — demonstrates real-world KMS key usage.
 *
 * Flow: Select KMS key → Enter password → Unlock key from IPFS →
 *       Use the actual AES-256 key to encrypt/decrypt messages.
 */
import { useState } from "react";
import { decryptKey, encryptWithKey, decryptWithKey } from "../services/EncryptionService";
import { fetchJSON } from "../services/IPFSService";

export default function EncryptDecryptPlayground({ keys, onBack, walletAddress, onDisconnect }) {
    // Key unlock state
    const [selectedKeyId, setSelectedKeyId] = useState("");
    const [unlockPassword, setUnlockPassword] = useState("");
    const [unlockedKey, setUnlockedKey] = useState(null);  // raw base64 key
    const [unlockedKeyName, setUnlockedKeyName] = useState("");
    const [unlocking, setUnlocking] = useState(false);

    // Encrypt/decrypt state
    const [plaintext, setPlaintext] = useState("");
    const [encryptedBundle, setEncryptedBundle] = useState(null);
    const [decryptedText, setDecryptedText] = useState(null);
    const [error, setError] = useState("");
    const [processing, setProcessing] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const activeKeys = keys.filter((k) => k.isActive);
    const selectedKeyData = activeKeys.find((k) => k.keyId === selectedKeyId);

    async function handleUnlock() {
        if (!selectedKeyId || !unlockPassword.trim()) {
            setError("Select a key and enter your password.");
            return;
        }
        setUnlocking(true);
        setError("");
        try {
            // Fetch encrypted blob from IPFS
            const encryptedBlob = await fetchJSON(selectedKeyData.ipfsCID);
            // Decrypt with password to get raw AES key
            const rawKey = await decryptKey(encryptedBlob, unlockPassword);
            setUnlockedKey(rawKey);
            setUnlockedKeyName(selectedKeyData.name);
        } catch {
            setError("Failed to unlock key — wrong password or corrupted data.");
        } finally {
            setUnlocking(false);
        }
    }

    async function handleEncrypt() {
        if (!plaintext.trim()) return;
        setProcessing(true);
        setError("");
        setDecryptedText(null);
        try {
            const bundle = await encryptWithKey(plaintext, unlockedKey);
            setEncryptedBundle(bundle);
        } catch (err) {
            setError("Encryption failed: " + err.message);
        } finally {
            setProcessing(false);
        }
    }

    async function handleDecrypt() {
        if (!encryptedBundle) return;
        setProcessing(true);
        setError("");
        try {
            const result = await decryptWithKey(encryptedBundle, unlockedKey);
            setDecryptedText(result);
        } catch {
            setError("Decryption failed — key or data may be corrupted.");
        } finally {
            setProcessing(false);
        }
    }

    function handleLock() {
        setUnlockedKey(null);
        setUnlockedKeyName("");
        setUnlockPassword("");
        setPlaintext("");
        setEncryptedBundle(null);
        setDecryptedText(null);
        setError("");
        setShowDetails(false);
    }

    return (
        <>
            <header className="header">
                <div className="container header-inner">
                    <div className="header-brand">
                        <div className="header-brand-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        </div>
                        Blockchain KMS
                    </div>
                    <div className="header-right">
                        <span className="badge badge-network">Sepolia</span>
                        <span className="header-address">
                            {walletAddress?.slice(0, 6)}…{walletAddress?.slice(-4)}
                        </span>
                        <button className="btn btn-ghost btn-sm" onClick={onDisconnect}>
                            Disconnect
                        </button>
                    </div>
                </div>
            </header>

            <main className="playground container">
                <button className="back-link" onClick={onBack}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                    Back to Dashboard
                </button>

                <div className="playground-hero">
                    <h1>Encrypt & Decrypt</h1>
                    <p>Use your KMS-managed keys to encrypt and decrypt real messages. Select a key, unlock it with your password, then encrypt data with the actual AES-256 key stored on IPFS.</p>
                </div>

                {error && (
                    <div className="alert alert-error" onClick={() => setError("")}>{error}</div>
                )}

                {/* ── Step 1: Unlock a key ─────────────── */}
                {!unlockedKey ? (
                    <div className="pg-unlock-section">
                        <div className="pg-step-indicator">
                            <div className="pg-step-dot active">1</div>
                            <div className="pg-step-line" />
                            <div className="pg-step-dot">2</div>
                            <div className="pg-step-line" />
                            <div className="pg-step-dot">3</div>
                        </div>

                        <div className="card pg-unlock-card">
                            <div className="pg-card-label">Step 1</div>
                            <h2>Unlock a Key</h2>
                            <p className="text-muted">Select one of your active KMS keys and enter the password you used during registration. The encrypted key material will be fetched from IPFS and decrypted in your browser.</p>

                            {activeKeys.length === 0 ? (
                                <div className="pg-empty">
                                    <p>No active keys found. Register a key first from the Dashboard.</p>
                                    <button className="btn btn-primary" onClick={onBack}>Go to Dashboard</button>
                                </div>
                            ) : (
                                <>
                                    <div className="input-group">
                                        <label>Select Key</label>
                                        <select
                                            className="input"
                                            value={selectedKeyId}
                                            onChange={(e) => setSelectedKeyId(e.target.value)}
                                        >
                                            <option value="">Choose a key...</option>
                                            {activeKeys.map((k) => (
                                                <option key={k.keyId} value={k.keyId}>
                                                    {k.name} — registered {k.registeredDate.toLocaleDateString()}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="input-group">
                                        <label>Password</label>
                                        <input
                                            className="input"
                                            type="password"
                                            placeholder="Enter your encryption password"
                                            value={unlockPassword}
                                            onChange={(e) => setUnlockPassword(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                                        />
                                    </div>

                                    <button
                                        className="btn btn-primary btn-full"
                                        onClick={handleUnlock}
                                        disabled={unlocking || !selectedKeyId || !unlockPassword.trim()}
                                    >
                                        {unlocking ? "Fetching from IPFS & Decrypting..." : "Unlock Key"}
                                    </button>

                                    {selectedKeyData && (
                                        <div className="pg-key-info">
                                            <div className="pg-key-info-row">
                                                <span>IPFS CID</span>
                                                <span className="mono truncate">{selectedKeyData.ipfsCID}</span>
                                            </div>
                                            <div className="pg-key-info-row">
                                                <span>Owner</span>
                                                <span className="mono truncate">{selectedKeyData.owner}</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    /* ── Step 2 & 3: Encrypt / Decrypt ──── */
                    <>
                        {/* Unlocked key banner */}
                        <div className="pg-unlocked-banner">
                            <div className="pg-unlocked-info">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>
                                <span>Key unlocked: <strong>{unlockedKeyName}</strong></span>
                            </div>
                            <button className="btn btn-ghost btn-sm" onClick={handleLock}>Lock & Switch Key</button>
                        </div>

                        <div className="pg-step-indicator">
                            <div className="pg-step-dot done">✓</div>
                            <div className="pg-step-line done" />
                            <div className="pg-step-dot active">2</div>
                            <div className="pg-step-line" />
                            <div className={`pg-step-dot ${decryptedText !== null ? "active" : ""}`}>3</div>
                        </div>

                        <div className="pg-grid">
                            {/* Encrypt Panel */}
                            <div className="card pg-panel">
                                <div className="pg-card-label">Step 2</div>
                                <h2>Encrypt a Message</h2>
                                <p className="text-muted">Your message will be encrypted using the AES-256-GCM key retrieved from IPFS. Nothing leaves your browser unencrypted.</p>

                                <div className="input-group">
                                    <label>Plaintext Message</label>
                                    <textarea
                                        className="input pg-textarea"
                                        placeholder="Type your secret message here..."
                                        value={plaintext}
                                        onChange={(e) => setPlaintext(e.target.value)}
                                        rows={4}
                                    />
                                    {plaintext && (
                                        <span className="input-hint">{new TextEncoder().encode(plaintext).length} bytes</span>
                                    )}
                                </div>

                                <button
                                    className="btn btn-primary btn-full"
                                    onClick={handleEncrypt}
                                    disabled={processing || !plaintext.trim()}
                                >
                                    {processing ? "Encrypting..." : "Encrypt Message"}
                                </button>
                            </div>

                            {/* Result Panel */}
                            <div className={`card pg-panel ${encryptedBundle ? "" : "pg-panel-dim"}`}>
                                <div className="pg-card-label">Step 3</div>
                                <h2>Ciphertext & Decrypt</h2>

                                {!encryptedBundle ? (
                                    <div className="pg-placeholder">
                                        <div className="pg-placeholder-icon">
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                        </div>
                                        <p>Encrypted output will appear here after you encrypt a message.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="pg-cipher-box">
                                            <label>Encrypted Output</label>
                                            <div className="pg-cipher-value mono">{encryptedBundle.ciphertext}</div>
                                        </div>

                                        <button
                                            className="btn btn-ghost btn-sm btn-full"
                                            onClick={() => setShowDetails(!showDetails)}
                                        >
                                            {showDetails ? "Hide" : "Show"} crypto parameters
                                        </button>

                                        {showDetails && (
                                            <div className="pg-details">
                                                <div className="pg-detail-row">
                                                    <span>Algorithm</span><span className="mono">{encryptedBundle.algorithm}</span>
                                                </div>
                                                <div className="pg-detail-row">
                                                    <span>IV (Nonce)</span><span className="mono truncate">{encryptedBundle.iv}</span>
                                                </div>
                                                <div className="pg-detail-row">
                                                    <span>Key Source</span><span className="mono">KMS: {unlockedKeyName}</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="pg-decrypt-area">
                                            <button
                                                className="btn btn-primary btn-full"
                                                onClick={handleDecrypt}
                                                disabled={processing}
                                            >
                                                {processing ? "Decrypting..." : "Decrypt with Same Key"}
                                            </button>
                                        </div>

                                        {decryptedText !== null && (
                                            <div className="pg-result-box">
                                                <label>Decrypted Message</label>
                                                <div className="pg-result-value">{decryptedText}</div>
                                                {decryptedText === plaintext && (
                                                    <div className="pg-match">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                                                        Matches original — integrity verified
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* How the connection works */}
                        <div className="card pg-flow-card">
                            <h3>How This Connected Flow Works</h3>
                            <div className="pg-flow-steps">
                                <div className="pg-flow-step">
                                    <div className="pg-flow-num">1</div>
                                    <div>
                                        <strong>Key Retrieved from Blockchain</strong>
                                        <p>Your key's IPFS CID was fetched from the smart contract on Ethereum Sepolia.</p>
                                    </div>
                                </div>
                                <div className="pg-flow-step">
                                    <div className="pg-flow-num">2</div>
                                    <div>
                                        <strong>Encrypted Blob Fetched from IPFS</strong>
                                        <p>The encrypted key material was downloaded from decentralized storage using the CID.</p>
                                    </div>
                                </div>
                                <div className="pg-flow-step">
                                    <div className="pg-flow-num">3</div>
                                    <div>
                                        <strong>Key Decrypted with Your Password</strong>
                                        <p>PBKDF2 derived an AES key from your password to decrypt the raw 256-bit key — all in your browser.</p>
                                    </div>
                                </div>
                                <div className="pg-flow-step">
                                    <div className="pg-flow-num">4</div>
                                    <div>
                                        <strong>Message Encrypted with the Real Key</strong>
                                        <p>Your message was encrypted using the actual AES-256-GCM key from the KMS — not a password derivative.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </>
    );
}
