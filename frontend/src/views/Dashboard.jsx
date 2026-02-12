/**
 * Dashboard — main view showing all user keys.
 */
export default function Dashboard({
    keys,
    onRegister,
    onSelect,
    onRotate,
    onRevoke,
}) {
    const active = keys.filter((k) => k.isActive).length;
    const revoked = keys.filter((k) => !k.isActive).length;

    return (
        <main className="dashboard container">
            {/* Hero Section */}
            <section className="hero">
                <h1>Manage Your Keys</h1>
                <p>Secure, decentralized key management for your blockchain assets. Register, rotate, and revoke keys with full on-chain transparency.</p>
            </section>

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
                <button className="btn btn-primary" onClick={onRegister}>
                    + Register New Key
                </button>
            </div>

            {/* Table or Empty */}
            {keys.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-state-icon">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
                    </div>
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
                                    <td style={{ fontSize: "0.82rem", color: "var(--text-1)" }}>
                                        {k.registeredDate.toLocaleString()}
                                    </td>
                                    <td style={{ fontSize: "0.82rem", color: "var(--text-1)" }}>
                                        {k.rotatedDate ? k.rotatedDate.toLocaleString() : "—"}
                                    </td>
                                    <td>
                                        <div className="key-actions">
                                            {k.isActive && (
                                                <>
                                                    <button className="btn btn-ghost btn-sm" onClick={() => onRotate(k)}>
                                                        Rotate
                                                    </button>
                                                    <button className="btn btn-danger-outline btn-sm" onClick={() => onRevoke(k)}>
                                                        Revoke
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                className="btn btn-ghost btn-sm"
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
    );
}
