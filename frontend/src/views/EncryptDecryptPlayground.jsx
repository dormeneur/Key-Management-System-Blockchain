/**
 * EncryptDecryptPlayground — demonstrates real-world KMS key usage.
 *
 * Flow: Select KMS key → Enter password → Unlock key from IPFS →
 *       Use the actual AES-256 key to encrypt/decrypt messages.
 */
import { useState } from "react";
import { decryptKey, encryptWithKey, decryptWithKey } from "../services/EncryptionService";
import { fetchJSON } from "../services/IPFSService";

export default function EncryptDecryptPlayground({ keys, walletAddress }) {
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
        <main className="playground container">
            <div className="playground-hero">
                <h1>Playground</h1>
                <p>Experience the full key lifecycle. Unlock a blockchain key to perform real-time AES-256 encryption and decryption in your browser.</p>
            </div>

            {error && (
                <div className="alert alert-error" onClick={() => setError("")}>{error}</div>
            )}

            <div className="pg-layout">
                {/* ── Sidebar: Key Management ───────────────── */}
                <aside className="pg-sidebar">
                    <div className={`card pg-unlock-card ${unlockedKey ? "pg-locked-overlay" : ""}`}>
                        <div className="pg-card-label">Key Control</div>

                        {!unlockedKey ? (
                            <>
                                <h2>Unlock Key</h2>
                                <p className="text-muted">Select an active key and enter your password to fetch and decrypt the raw key material.</p>

                                {activeKeys.length === 0 ? (
                                    <div className="pg-empty">
                                        <p>No active keys found. Register a key first.</p>
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
                                                        {k.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <label>Password</label>
                                            <input
                                                className="input"
                                                type="password"
                                                placeholder="Enter password"
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
                                            {unlocking ? "Unlocking..." : "Unlock Key"}
                                        </button>
                                    </>
                                )}
                            </>
                        ) : (
                            /* Unlocked State in Sidebar */
                            <div className="pg-unlocked-state">
                                <div className="pg-unlocked-status">
                                    <div className="pg-unlocked-status-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
                                    </div>
                                    <h3>Key Unlocked</h3>
                                    <p>{unlockedKeyName}</p>
                                </div>
                                <button className="btn btn-ghost btn-full" onClick={handleLock}>
                                    Lock & Switch Key
                                </button>
                            </div>
                        )}

                        {selectedKeyData && !unlockedKey && (
                            <div className="pg-key-info">
                                <div className="pg-meta-item" style={{ justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <strong>ID</strong> <span className="mono">{selectedKeyData.keyId.slice(0, 10)}...{selectedKeyData.keyId.slice(-8)}</span>
                                </div>
                                <div className="pg-meta-item" style={{ justifyContent: 'space-between' }}>
                                    <strong>CID</strong> <span className="mono">{selectedKeyData.ipfsCID.slice(0, 10)}...{selectedKeyData.ipfsCID.slice(-8)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* ── Main: Operations ──────────────────────── */}
                <div className="pg-main">
                    {/* Encrypt Panel */}
                    <div className={`card pg-panel ${!unlockedKey ? "pg-disabled" : ""}`}>
                        <div className="pg-card-label">Input</div>
                        <h2>Encrypt Message</h2>
                        <div className="input-group">
                            <textarea
                                className="input pg-textarea"
                                placeholder={unlockedKey ? "Type a secret message..." : "Unlock a key to start encrypting..."}
                                value={plaintext}
                                onChange={(e) => setPlaintext(e.target.value)}
                                disabled={!unlockedKey}
                            />
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={handleEncrypt}
                            disabled={processing || !plaintext.trim() || !unlockedKey}
                        >
                            {processing ? "Encrypting..." : "Encrypt Data"}
                        </button>
                    </div>

                    {/* Decrypt Panel */}
                    <div className={`card pg-panel ${!encryptedBundle ? "pg-disabled" : ""}`}>
                        <div className="pg-card-label">Output</div>
                        <h2>Ciphertext & Decryption</h2>

                        {!encryptedBundle ? (
                            <div className="pg-placeholder">
                                <p>Encrypted output will appear here.</p>
                            </div>
                        ) : (
                            <>
                                <div className="pg-cipher-box">
                                    <label>Ciphertext (Base64)</label>
                                    <div className="pg-cipher-value mono">{encryptedBundle.ciphertext}</div>
                                </div>

                                <div className="pg-crypto-meta">
                                    <div className="pg-meta-item">
                                        <strong>Algo</strong> <span>AES-256-GCM</span>
                                    </div>
                                    <div className="pg-meta-item">
                                        <strong>IV</strong> <span>{encryptedBundle.iv.slice(0, 5)}...{encryptedBundle.iv.slice(-5)}</span>
                                    </div>
                                    <div className="pg-meta-item">
                                        <strong>Tag</strong> <span>128-bit</span>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-primary btn-full"
                                    onClick={handleDecrypt}
                                    disabled={processing}
                                    style={{ marginBottom: '20px' }}
                                >
                                    {processing ? "Decrypting..." : "Decrypt Message"}
                                </button>

                                {decryptedText !== null && (
                                    <div className="pg-result-box">
                                        <label>Decrypted Result</label>
                                        <div className="pg-result-value">{decryptedText}</div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
