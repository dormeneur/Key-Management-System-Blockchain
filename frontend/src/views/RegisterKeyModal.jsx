import { useState } from "react";

/**
 * RegisterKeyModal — form to register a new key.
 */
export default function RegisterKeyModal({ onSubmit, onClose }) {
    const [keyName, setKeyName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [error, setError] = useState("");

    function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!keyName.trim()) return setError("Key name is required.");
        if (password.length < 8) return setError("Password must be at least 8 characters.");
        if (password !== confirmPwd) return setError("Passwords do not match.");

        onSubmit(keyName.trim(), password);
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>Register New Key</h2>

                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="keyName">Key Name</label>
                        <input
                            id="keyName"
                            className="input"
                            type="text"
                            placeholder="e.g. MyAppKey"
                            value={keyName}
                            onChange={(e) => setKeyName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Encryption Password</label>
                        <input
                            id="password"
                            className="input"
                            type="password"
                            placeholder="Min 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="confirmPwd">Confirm Password</label>
                        <input
                            id="confirmPwd"
                            className="input"
                            type="password"
                            placeholder="Re-enter password"
                            value={confirmPwd}
                            onChange={(e) => setConfirmPwd(e.target.value)}
                        />
                    </div>

                    {error && (
                        <p style={{ color: "var(--danger)", fontSize: "0.82rem" }}>{error}</p>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            🔐 Register Key
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
