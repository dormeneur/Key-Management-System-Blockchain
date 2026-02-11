/**
 * Dashboard — main view showing all user keys.
 */
export default function Dashboard({
    keys,
    onRegister,
    onSelect,
    onRotate,
    onRevoke,
    walletAddress,
    onDisconnect,
    onPlayground,
}) {
    const active = keys.filter((k) => k.isActive).length;
    const revoked = keys.filter((k) => !k.isActive).length;

    return (
        <>
            {/* Header */}
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

            {/* Content */}
            <main className="dashboard container">
                {/* Stats */}
                <div className="dashboard-stats">
                    <div className="card stat-card">
                        <div className="stat-value">{keys.length}</div>
                        <div className="stat-label">Total Keys</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value">{active}</div>
                        <div className="stat-label">Active</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value">{revoked}</div>
                        <div className="stat-label">Revoked</div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="dashboard-header">
                    <h2>Your Keys</h2>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button className="btn btn-secondary" onClick={onPlayground}>
                            🧪 Encrypt / Decrypt
                        </button>
                        <button className="btn btn-primary" onClick={onRegister}>
                            + Register New Key
                        </button>
                    </div>
                </div>

                {/* Table or Empty */}
                {keys.length === 0 ? (
                    <div className="card empty-state">
                        <div className="empty-state-icon">🗝️</div>
                        <h3>No keys registered yet</h3>
                        <p>Click "Register New Key" to create your first encrypted key.</p>
                    </div>
                ) : (
                    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                        <table className="key-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>State</th>
                                    <th>Registered</th>
                                    <th>Last Rotated</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {keys.map((k) => (
                                    <tr key={k.keyId}>
                                        <td
                                            style={{ cursor: "pointer", fontWeight: 600 }}
                                            onClick={() => onSelect(k)}
                                        >
                                            {k.name}
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${k.isActive ? "badge-active" : "badge-revoked"}`}
                                            >
                                                {k.stateLabel}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                                            {k.registeredDate.toLocaleString()}
                                        </td>
                                        <td style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                                            {k.rotatedDate ? k.rotatedDate.toLocaleString() : "—"}
                                        </td>
                                        <td>
                                            <div className="key-actions">
                                                {k.isActive && (
                                                    <>
                                                        <button className="btn btn-secondary btn-sm" onClick={() => onRotate(k)}>
                                                            Rotate
                                                        </button>
                                                        <button className="btn btn-danger btn-sm" onClick={() => onRevoke(k)}>
                                                            Revoke
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => onSelect(k)}
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </>
    );
}
