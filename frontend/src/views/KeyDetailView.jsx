import { useEffect, useState } from "react";
import { CONFIG } from "../constants/config";
import { gatewayURL } from "../services/IPFSService";

/**
 * KeyDetailView — metadata, IPFS link, actions, and event timeline.
 */
export default function KeyDetailView({
    keyData,
    onBack,
    onRotate,
    onRevoke,
    getKeyEvents,
}) {
    const [events, setEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const evts = await getKeyEvents(keyData.keyId);
                if (!cancelled) setEvents(evts);
            } catch {
                /* ignore */
            } finally {
                if (!cancelled) setLoadingEvents(false);
            }
        })();
        return () => { cancelled = true; };
    }, [keyData.keyId, getKeyEvents]);

    const etherscanTx = (hash) =>
        `${CONFIG.ETHERSCAN_BASE}/tx/${hash}`;

    const eventLabel = {
        KeyRegistered: "Registered",
        KeyRotated: "Rotated",
        KeyRevoked: "Revoked",
    };

    const eventClass = {
        KeyRegistered: "registered",
        KeyRotated: "rotated",
        KeyRevoked: "revoked",
    };

    return (
        <div className="detail container">
            <button className="back-link" onClick={onBack}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                Back to Dashboard
            </button>

            <div className="detail-header">
                <h2>{keyData.name}</h2>
                <span
                    className={`badge ${keyData.isActive ? "badge-active" : "badge-revoked"}`}
                >
                    {keyData.stateLabel}
                </span>
            </div>

            {/* Metadata */}
            <div className="card detail-grid">
                <div className="detail-field">
                    <label>Key ID</label>
                    <span className="mono">{keyData.keyId}</span>
                </div>
                <div className="detail-field">
                    <label>Owner</label>
                    <span className="mono">{keyData.owner}</span>
                </div>
                <div className="detail-field">
                    <label>IPFS CID</label>
                    <span>
                        <a
                            href={gatewayURL(keyData.ipfsCID)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mono"
                        >
                            {keyData.ipfsCID}
                        </a>
                    </span>
                </div>
                <div className="detail-field">
                    <label>Registered At</label>
                    <span>{keyData.registeredDate.toLocaleString()}</span>
                </div>
                <div className="detail-field">
                    <label>Last Rotated</label>
                    <span>
                        {keyData.rotatedDate
                            ? keyData.rotatedDate.toLocaleString()
                            : "Never"}
                    </span>
                </div>
            </div>

            {/* Actions */}
            {keyData.isActive && (
                <div className="detail-actions">
                    <button className="btn btn-ghost" onClick={() => onRotate(keyData)}>
                        Rotate Key
                    </button>
                    <button className="btn btn-danger-outline" onClick={() => onRevoke(keyData)}>
                        Revoke Key
                    </button>
                </div>
            )}

            {/* Timeline */}
            <h3 style={{ marginBottom: 16, fontWeight: 600, fontSize: "1.1rem" }}>
                Audit Trail
            </h3>
            {loadingEvents ? (
                <p style={{ color: "var(--text-2)", fontSize: "0.85rem" }}>
                    Loading events…
                </p>
            ) : events.length === 0 ? (
                <p style={{ color: "var(--text-2)", fontSize: "0.85rem" }}>
                    No events found.
                </p>
            ) : (
                <div className="timeline">
                    {events.map((ev, i) => (
                        <div
                            key={i}
                            className={`timeline-item ${eventClass[ev.eventName] || ""}`}
                        >
                            <h4>{eventLabel[ev.eventName] || ev.eventName}</h4>
                            <p>Block #{ev.blockNumber}</p>
                            <a
                                href={etherscanTx(ev.transactionHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View on Etherscan →
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
