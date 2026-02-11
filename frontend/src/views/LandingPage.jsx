/**
 * LandingPage — shown when wallet is not connected.
 */
export default function LandingPage({ onConnect, connecting }) {
    return (
        <main className="landing">
            <div className="landing-logo">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
            </div>
            <h1>Blockchain KMS</h1>
            <p>
                A decentralized key management system powered by Ethereum
                smart contracts and IPFS. Manage cryptographic keys with
                immutable audit trails.
            </p>
            <button
                className="btn btn-primary"
                onClick={onConnect}
                disabled={connecting}
            >
                {connecting ? "Connecting..." : "Connect Wallet"}
            </button>

            <div className="landing-features">
                <div className="landing-feature">
                    <div className="landing-feature-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>
                    <h3>AES-256-GCM</h3>
                    <p>Client-side encryption with authenticated ciphers</p>
                </div>
                <div className="landing-feature">
                    <div className="landing-feature-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                    </div>
                    <h3>Smart Contract</h3>
                    <p>On-chain lifecycle with Solidity access control</p>
                </div>
                <div className="landing-feature">
                    <div className="landing-feature-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    </div>
                    <h3>IPFS Storage</h3>
                    <p>Decentralized, content-addressed key storage</p>
                </div>
                <div className="landing-feature">
                    <div className="landing-feature-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                    </div>
                    <h3>Audit Trail</h3>
                    <p>Immutable event logs on Ethereum blockchain</p>
                </div>
            </div>
        </main>
    );
}
