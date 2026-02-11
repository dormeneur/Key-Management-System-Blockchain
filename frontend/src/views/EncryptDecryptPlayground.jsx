/**
 * EncryptDecryptPlayground — interactive demo of AES-256-GCM encryption.
 * Lets users type a message, encrypt it, and decrypt it back to
 * demonstrate the practical use case of the KMS keys.
 */
import { useState } from "react";
import { encryptMessage, decryptMessage } from "../services/EncryptionService";

export default function EncryptDecryptPlayground({ onBack, walletAddress, onDisconnect }) {
    const [plaintext, setPlaintext] = useState("");
    const [password, setPassword] = useState("");
    const [encryptedBundle, setEncryptedBundle] = useState(null);
    const [decryptPassword, setDecryptPassword] = useState("");
    const [decryptedText, setDecryptedText] = useState(null);
    const [error, setError] = useState("");
    const [encrypting, setEncrypting] = useState(false);
    const [decrypting, setDecrypting] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    async function handleEncrypt() {
        if (!plaintext.trim() || !password.trim()) {
            setError("Please enter both a message and a password.");
            return;
        }
        setEncrypting(true);
        setError("");
        setDecryptedText(null);
        setDecryptPassword("");
        try {
            const bundle = await encryptMessage(plaintext, password);
            setEncryptedBundle(bundle);
        } catch (err) {
            setError("Encryption failed: " + err.message);
        } finally {
            setEncrypting(false);
        }
    }

    async function handleDecrypt() {
        if (!decryptPassword.trim()) {
            setError("Please enter the decryption password.");
            return;
        }
        setDecrypting(true);
        setError("");
        setDecryptedText(null);
        try {
            const result = await decryptMessage(encryptedBundle, decryptPassword);
            setDecryptedText(result);
        } catch {
            setError("❌ Decryption failed — wrong password or tampered data!");
        } finally {
            setDecrypting(false);
        }
    }

    function handleReset() {
        setPlaintext("");
        setPassword("");
        setEncryptedBundle(null);
        setDecryptPassword("");
        setDecryptedText(null);
        setError("");
        setShowDetails(false);
    }

    return (
        <>
            {/* Header (same style as dashboard) */}
            <header className="header">
                <div className="container header-inner">
                    <div className="header-brand">
                        <div className="header-brand-icon">🔐</div>
                        Blockchain KMS
                    </div>
                    <div className="header-right">
                        <span className="badge badge-network">● Sepolia</span>
                        <span className="header-address">
                            {walletAddress?.slice(0, 6)}…{walletAddress?.slice(-4)}
                        </span>
                        <button className="btn btn-secondary btn-sm" onClick={onDisconnect}>
                            Disconnect
                        </button>
                    </div>
                </div>
            </header>

            <main className="playground container">
                <button className="detail-back" onClick={onBack}>
                    ← Back to Dashboard
                </button>

                <div className="playground-hero">
                    <h1>🧪 Encrypt / Decrypt Playground</h1>
                    <p>See AES-256-GCM encryption in action. Type a message, encrypt it with a password, then try decrypting it.</p>
                </div>

                {error && (
                    <div className="playground-error">{error}</div>
                )}

                <div className="playground-grid">
                    {/* ── Encrypt Panel ────────────────────── */}
                    <div className="card playground-panel">
                        <div className="playground-panel-header">
                            <span className="playground-panel-icon encrypt-icon">🔒</span>
                            <h2>Encrypt</h2>
                        </div>

                        <div className="input-group">
                            <label>Your Secret Message</label>
                            <textarea
                                className="input playground-textarea"
                                placeholder="Type your secret message here..."
                                value={plaintext}
                                onChange={(e) => setPlaintext(e.target.value)}
                                rows={4}
                            />
                        </div>

                        <div className="input-group">
                            <label>Encryption Password</label>
                            <input
                                className="input"
                                type="password"
                                placeholder="Enter a strong password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={handleEncrypt}
                            disabled={encrypting || !plaintext.trim() || !password.trim()}
                            style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
                        >
                            {encrypting ? "Encrypting..." : "🔒 Encrypt Message"}
                        </button>
                    </div>

                    {/* ── Arrow ─────────────────────────── */}
                    <div className="playground-arrow">
                        <div className="playground-arrow-line" />
                        <span>AES-256-GCM</span>
                        <div className="playground-arrow-line" />
                    </div>

                    {/* ── Result Panel ────────────────────── */}
                    <div className={`card playground-panel ${encryptedBundle ? "panel-active" : "panel-waiting"}`}>
                        <div className="playground-panel-header">
                            <span className="playground-panel-icon result-icon">
                                {decryptedText !== null ? "✅" : "📄"}
                            </span>
                            <h2>{decryptedText !== null ? "Decrypted" : "Ciphertext"}</h2>
                        </div>

                        {!encryptedBundle ? (
                            <div className="playground-placeholder">
                                <span>🔐</span>
                                <p>Encrypted output will appear here</p>
                            </div>
                        ) : (
                            <>
                                {/* Ciphertext display */}
                                <div className="playground-ciphertext-box">
                                    <label>Encrypted Output (Base64)</label>
                                    <div className="playground-cipher-text mono">
                                        {encryptedBundle.ciphertext}
                                    </div>
                                </div>

                                {/* Crypto details toggle */}
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setShowDetails(!showDetails)}
                                    style={{ width: "100%", justifyContent: "center", marginBottom: 12 }}
                                >
                                    {showDetails ? "Hide" : "Show"} Crypto Details
                                </button>

                                {showDetails && (
                                    <div className="playground-details">
                                        <div className="playground-detail-row">
                                            <span>Algorithm</span>
                                            <span className="mono">{encryptedBundle.algorithm}</span>
                                        </div>
                                        <div className="playground-detail-row">
                                            <span>IV (Nonce)</span>
                                            <span className="mono">{encryptedBundle.iv}</span>
                                        </div>
                                        <div className="playground-detail-row">
                                            <span>Salt</span>
                                            <span className="mono">{encryptedBundle.salt}</span>
                                        </div>
                                        <div className="playground-detail-row">
                                            <span>Key Derivation</span>
                                            <span className="mono">PBKDF2 (100k iterations)</span>
                                        </div>
                                    </div>
                                )}

                                {/* Decrypt section */}
                                <div className="playground-decrypt-section">
                                    <div className="input-group">
                                        <label>Decryption Password</label>
                                        <input
                                            className="input"
                                            type="password"
                                            placeholder="Enter password to decrypt"
                                            value={decryptPassword}
                                            onChange={(e) => {
                                                setDecryptPassword(e.target.value);
                                                setDecryptedText(null);
                                                setError("");
                                            }}
                                        />
                                    </div>

                                    <button
                                        className="btn btn-primary"
                                        onClick={handleDecrypt}
                                        disabled={decrypting || !decryptPassword.trim()}
                                        style={{ width: "100%", justifyContent: "center" }}
                                    >
                                        {decrypting ? "Decrypting..." : "🔓 Decrypt Message"}
                                    </button>
                                </div>

                                {/* Decrypted result */}
                                {decryptedText !== null && (
                                    <div className="playground-decrypted-result">
                                        <label>✅ Decrypted Message</label>
                                        <div className="playground-decrypted-text">{decryptedText}</div>
                                        {decryptedText === plaintext && (
                                            <div className="playground-match-badge">
                                                ✓ Matches original message perfectly!
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {encryptedBundle && (
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={handleReset}
                                style={{ width: "100%", justifyContent: "center", marginTop: 12 }}
                            >
                                🔄 Reset & Try Again
                            </button>
                        )}
                    </div>
                </div>

                {/* How it works section */}
                <div className="playground-how-it-works">
                    <h3>How AES-256-GCM Works</h3>
                    <div className="playground-steps">
                        <div className="playground-step">
                            <div className="playground-step-num">1</div>
                            <div>
                                <strong>Key Derivation</strong>
                                <p>Your password is run through PBKDF2 with 100,000 SHA-256 iterations and a random salt to produce a 256-bit AES key.</p>
                            </div>
                        </div>
                        <div className="playground-step">
                            <div className="playground-step-num">2</div>
                            <div>
                                <strong>Encryption</strong>
                                <p>The message is encrypted with AES in Galois/Counter Mode using a random 96-bit IV, producing ciphertext + a 128-bit authentication tag.</p>
                            </div>
                        </div>
                        <div className="playground-step">
                            <div className="playground-step-num">3</div>
                            <div>
                                <strong>Integrity Check</strong>
                                <p>GCM mode authenticates the data — if any bit is altered, decryption fails automatically. This detects tampering.</p>
                            </div>
                        </div>
                        <div className="playground-step">
                            <div className="playground-step-num">4</div>
                            <div>
                                <strong>Decryption</strong>
                                <p>The correct password re-derives the same AES key (using the stored salt), which decrypts and verifies the ciphertext.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
