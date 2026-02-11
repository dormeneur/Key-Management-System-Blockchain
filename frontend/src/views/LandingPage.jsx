import { CONFIG } from "../constants/config";

/**
 * LandingPage — shown when the wallet is not connected.
 */
export default function LandingPage({ onConnect, connecting }) {
    return (
        <div className="landing">
            <div className="landing-logo">🔐</div>
            <h1>Blockchain KMS</h1>
            <p>
                A decentralized Key Management System powered by Ethereum smart
                contracts, IPFS storage, and client-side AES-256 encryption.
            </p>

            <button
                className="btn btn-primary"
                onClick={onConnect}
                disabled={connecting}
            >
                {connecting ? "Connecting…" : "🦊 Connect MetaMask"}
            </button>

            <span
                className="badge badge-network"
                style={{ marginTop: 16 }}
            >
                ● {CONFIG.CHAIN_NAME}
            </span>

            <div className="landing-features">
                <div className="landing-feature">
                    <div className="landing-feature-icon">🔗</div>
                    <h3>On-Chain Audit</h3>
                    <p>Immutable lifecycle events on Ethereum</p>
                </div>
                <div className="landing-feature">
                    <div className="landing-feature-icon">🔒</div>
                    <h3>AES-256-GCM</h3>
                    <p>Browser-side encryption — keys never exposed</p>
                </div>
                <div className="landing-feature">
                    <div className="landing-feature-icon">🌐</div>
                    <h3>IPFS Storage</h3>
                    <p>Encrypted blobs on decentralized storage</p>
                </div>
            </div>
        </div>
    );
}
