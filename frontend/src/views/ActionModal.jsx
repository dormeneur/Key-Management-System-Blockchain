import { useState } from "react";

/**
 * ActionModal — simplified confirmation/input dialog.
 * 
 * Props:
 * - type: "rotate" | "revoke"
 * - keyData: { name, ... }
 * - onClose: () => void
 * - onConfirm: (password?) => void
 */
export default function ActionModal({ type, keyData, onClose, onConfirm }) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const isRevoke = type === "revoke";
    const title = isRevoke ? "Revoke Key" : "Rotate Key";
    const confirmLabel = isRevoke ? "Yes, Revoke" : "Rotate Key";
    const btnClass = isRevoke ? "btn-danger" : "btn-primary";

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!isRevoke && !password) {
            return setError("Password is required.");
        }

        setLoading(true);
        try {
            await onConfirm(password);
            onClose();
        } catch (err) {
            setError(err.message || "Action failed.");
            setLoading(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>{title}</h2>

                <form className="modal-form" onSubmit={handleSubmit}>
                    {isRevoke ? (
                        <p style={{ color: "var(--text-1)", marginBottom: "16px", lineHeight: "1.5" }}>
                            Are you sure you want to revoke <strong>{keyData.name}</strong>?
                            <br />
                            <span style={{ color: "var(--danger)", fontSize: "0.85rem" }}>
                                This action cannot be undone.
                            </span>
                        </p>
                    ) : (
                        <div className="input-group">
                            <label htmlFor="actionPassword">Enter Encryption Password</label>
                            <input
                                id="actionPassword"
                                className="input"
                                type="password"
                                placeholder="Start typing..."
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoFocus
                            />
                        </div>
                    )}

                    {error && (
                        <p style={{ color: "var(--danger)", fontSize: "0.82rem" }}>{error}</p>
                    )}

                    <div className="modal-actions" style={{ marginTop: "16px" }}>
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`btn ${btnClass}`}
                            disabled={loading}
                        >
                            {loading ? "Processing..." : confirmLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
