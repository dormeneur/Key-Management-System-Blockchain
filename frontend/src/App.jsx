import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { CONFIG } from "./constants/config";
import { useKeyLifecycle } from "./viewmodels/useKeyLifecycle";
import { KeyLifecycleService } from "./services/KeyLifecycleService";
import LandingPage from "./views/LandingPage";
import Dashboard from "./views/Dashboard";
import RegisterKeyModal from "./views/RegisterKeyModal";
import KeyDetailView from "./views/KeyDetailView";
import EncryptDecryptPlayground from "./views/EncryptDecryptPlayground";
import "./index.css";

const KEY_NAMES_STORAGE = "kms_key_names";

function loadKeyNames() {
    try {
        return JSON.parse(localStorage.getItem(KEY_NAMES_STORAGE) || "{}");
    } catch {
        return {};
    }
}
function saveKeyName(keyId, name) {
    const names = loadKeyNames();
    names[keyId] = name;
    localStorage.setItem(KEY_NAMES_STORAGE, JSON.stringify(names));
}

export default function App() {
    // ── Wallet state ───────────────────────────────────────────
    const [signer, setSigner] = useState(null);
    const [walletAddress, setWalletAddress] = useState("");
    const [connecting, setConnecting] = useState(false);

    // ── UI state ───────────────────────────────────────────
    const [activeTab, setActiveTab] = useState("home"); // home | playground
    const [showRegister, setShowRegister] = useState(false);
    const [selectedKey, setSelectedKey] = useState(null); // for detail overlay
    const [keyNames, setKeyNames] = useState(loadKeyNames());

    // ── Password prompt for rotate ─────────────────────────────
    const [rotateTarget, setRotateTarget] = useState(null);

    // ── ViewModel ──────────────────────────────────────────────
    const vm = useKeyLifecycle(signer, CONFIG.CONTRACT_ADDRESS, keyNames);

    // ── Connect wallet ─────────────────────────────────────────
    const connectWallet = useCallback(async () => {
        if (!window.ethereum) {
            alert("MetaMask is not installed. Please install it to continue.");
            return;
        }
        setConnecting(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);

            // Request correct network
            const network = await provider.getNetwork();
            if (Number(network.chainId) !== CONFIG.CHAIN_ID) {
                try {
                    await window.ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: "0x" + CONFIG.CHAIN_ID.toString(16) }],
                    });
                } catch {
                    alert("Please switch MetaMask to Sepolia testnet manually.");
                    setConnecting(false);
                    return;
                }
            }

            const s = await provider.getSigner();
            const addr = await s.getAddress();
            setSigner(s);
            setWalletAddress(addr);
        } catch (err) {
            console.error("Wallet connect error:", err);
            alert("Failed to connect wallet: " + err.message);
        } finally {
            setConnecting(false);
        }
    }, []);

    const disconnect = () => {
        setSigner(null);
        setWalletAddress("");
        setActiveTab("home");
        setSelectedKey(null);
    };

    // ── Load keys after connecting ─────────────────────────────
    useEffect(() => {
        if (signer) vm.loadKeys();
    }, [signer]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Auto-reconnect if already authorized ───────────────────
    useEffect(() => {
        if (window.ethereum) {
            window.ethereum
                .request({ method: "eth_accounts" })
                .then((accounts) => {
                    if (accounts.length > 0) connectWallet();
                })
                .catch(() => { });
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Handlers ───────────────────────────────────────────────

    async function handleRegister(keyName, password) {
        setShowRegister(false);
        try {
            const result = await vm.registerKey(keyName, password, CONFIG.PINATA_JWT);
            if (result) {
                saveKeyName(result.keyId, keyName);
                setKeyNames(loadKeyNames());
                await vm.loadKeys();
            }
        } catch {
            // error is handled inside vm
        }
    }

    async function handleRotate(keyData) {
        const password = prompt("Enter your encryption password to rotate this key:");
        if (!password) return;
        try {
            await vm.rotateKey(keyData.keyId, password, CONFIG.PINATA_JWT);
            await vm.loadKeys();
            if (selectedKey?.keyId === keyData.keyId) {
                // Refresh detail
                const updated = vm.keys.find((k) => k.keyId === keyData.keyId);
                if (updated) setSelectedKey(updated);
            }
        } catch {
            // handled in vm
        }
    }

    async function handleRevoke(keyData) {
        if (!confirm(`Are you sure you want to revoke "${keyData.name}"? This is irreversible.`)) return;
        try {
            await vm.revokeKey(keyData.keyId);
            await vm.loadKeys();
            if (selectedKey?.keyId === keyData.keyId) {
                const updated = vm.keys.find((k) => k.keyId === keyData.keyId);
                if (updated) setSelectedKey(updated);
            }
        } catch {
            // handled in vm
        }
    }

    function handleSelectKey(keyData) {
        setSelectedKey(keyData);
        // Detail view is now an overlay, no tab change needed
    }

    // ── Render ─────────────────────────────────────────────────

    // Not connected → Landing
    if (!signer) {
        return <LandingPage onConnect={connectWallet} connecting={connecting} />;
    }

    return (
        <>
            {/* Loading overlay */}
            {vm.loading && (
                <div className="loading-overlay">
                    <div className="spinner" />
                    <div className="loading-text">{vm.status}</div>
                </div>
            )}

            {/* Toast: success */}
            {vm.txHash && (
                <div className="toast toast-success" onClick={vm.clearTx}>
                    ✅ Transaction confirmed!{" "}
                    <a
                        href={`${CONFIG.ETHERSCAN_BASE}/tx/${vm.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--accent)", marginLeft: 4 }}
                    >
                        View on Etherscan →
                    </a>
                </div>
            )}

            {/* Toast: error */}
            {vm.error && (
                <div className="toast toast-error" onClick={vm.clearError}>
                    ❌ {vm.error}
                </div>
            )}

            {/* Register modal */}
            {showRegister && (
                <RegisterKeyModal
                    onSubmit={handleRegister}
                    onClose={() => setShowRegister(false)}
                />
            )}

            {/* Header with tabs */}
            <header className="header">
                <div className="container header-inner">
                    <div className="header-brand">
                        <div className="header-brand-icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        </div>
                        Blockchain KMS
                    </div>
                    <div className="header-tabs">
                        <button
                            className={`tab ${activeTab === "home" ? "tab-active" : ""}`}
                            onClick={() => setActiveTab("home")}
                        >
                            Home
                        </button>
                        <button
                            className={`tab ${activeTab === "playground" ? "tab-active" : ""}`}
                            onClick={() => setActiveTab("playground")}
                        >
                            Playground
                        </button>
                    </div>
                    <div className="header-right">
                        <span className="badge badge-network">Sepolia</span>
                        <span className="header-address">
                            {walletAddress?.slice(0, 6)}…{walletAddress?.slice(-4)}
                        </span>
                        <button className="btn btn-ghost btn-sm" onClick={disconnect}>
                            Disconnect
                        </button>
                    </div>
                </div>
            </header>

            {/* Tab content with slide animation */}
            <div className="tab-content-wrapper">
                <div className={`tab-content ${activeTab === "home" ? "tab-content-active" : "tab-content-hidden"}`}>
                    <Dashboard
                        keys={vm.keys}
                        walletAddress={walletAddress}
                        onRegister={() => setShowRegister(true)}
                        onSelect={handleSelectKey}
                        onRotate={handleRotate}
                        onRevoke={handleRevoke}
                    />
                </div>
                <div className={`tab-content ${activeTab === "playground" ? "tab-content-active" : "tab-content-hidden"}`}>
                    <EncryptDecryptPlayground
                        keys={vm.keys}
                        walletAddress={walletAddress}
                    />
                </div>
            </div>

            {/* Detail view overlay */}
            {selectedKey && (
                <div className="detail-overlay" onClick={() => setSelectedKey(null)}>
                    <div className="detail-overlay-content" onClick={(e) => e.stopPropagation()}>
                        <KeyDetailView
                            keyData={selectedKey}
                            onBack={() => {
                                setSelectedKey(null);
                                vm.loadKeys();
                            }}
                            onRotate={handleRotate}
                            onRevoke={handleRevoke}
                            getKeyEvents={vm.getKeyEvents}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
