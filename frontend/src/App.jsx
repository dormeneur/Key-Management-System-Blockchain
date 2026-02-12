import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { CONFIG } from "./constants/config";
import { useKeyLifecycle } from "./viewmodels/useKeyLifecycle";
import { KeyLifecycleService } from "./services/KeyLifecycleService";
import { useInternetStatus } from "./hooks/useInternetStatus";
import LandingPage from "./views/LandingPage";
import Dashboard from "./views/Dashboard";
import RegisterKeyModal from "./views/RegisterKeyModal";
import KeyDetailView from "./views/KeyDetailView";
import EncryptDecryptPlayground from "./views/EncryptDecryptPlayground";
import ActionModal from "./views/ActionModal";
import DocsPage from "./views/DocsPage";
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
    // ── Internet connectivity state ────────────────────────────
    const isOnline = useInternetStatus();

    // ── Wallet state ───────────────────────────────────────────
    const [signer, setSigner] = useState(null);
    const [walletAddress, setWalletAddress] = useState("");
    const [connecting, setConnecting] = useState(false);

    // ── UI state ───────────────────────────────────────────
    const [activeTab, setActiveTab] = useState("home"); // home | playground | docs
    const [showRegister, setShowRegister] = useState(false);
    const [selectedKey, setSelectedKey] = useState(null); // for detail overlay
    const [keyNames, setKeyNames] = useState(loadKeyNames());

    // ── Action Modal (Rotate/Revoke) ───────────────────────────
    const [actionModal, setActionModal] = useState(null); // { type: 'rotate'|'revoke', keyData }

    // ── ViewModel ──────────────────────────────────────────────
    const vm = useKeyLifecycle(signer, CONFIG.CONTRACT_ADDRESS, keyNames);

    // ── Connect wallet ─────────────────────────────────────────
    const connectWallet = useCallback(async () => {
        if (!isOnline) {
            alert("You are currently offline. Please check your internet connection.");
            return;
        }
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
            const errorMsg = err.message || "Unknown error";
            if (errorMsg.includes("Failed to fetch") || errorMsg.includes("offline")) {
                alert("Network error: Please check your internet connection and try again.");
            } else {
                alert("Failed to connect wallet: " + errorMsg);
            }
        } finally {
            setConnecting(false);
        }
    }, [isOnline]);

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

    // ── Global Hotkeys (Escape to dismiss) ─────────────────────
    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === "Escape") {
                if (actionModal) {
                    setActionModal(null);
                    return;
                }
                if (showRegister) {
                    setShowRegister(false);
                    return;
                }
                if (selectedKey) {
                    setSelectedKey(null);
                    return;
                }
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [actionModal, showRegister, selectedKey]);

    // ── Suppress network errors when offline ────────────────────
    useEffect(() => {
        const originalError = console.error;
        const originalWarn = console.warn;

        // Suppress offline-related errors
        const shouldSuppress = (message) => {
            if (!message) return false;
            const msg = String(message).toLowerCase();
            return (
                msg.includes("failed to fetch") ||
                msg.includes("err_internet_disconnected") ||
                msg.includes("net::") ||
                msg.includes("rpc error") ||
                (msg.includes("metmask") && msg.includes("failed"))
            );
        };

        console.error = function (...args) {
            const message = args[0];
            if (!shouldSuppress(message)) {
                originalError.apply(console, args);
            }
        };

        console.warn = function (...args) {
            const message = args[0];
            if (!shouldSuppress(message)) {
                originalWarn.apply(console, args);
            }
        };

        return () => {
            console.error = originalError;
            console.warn = originalWarn;
        };
    }, []);

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

    function handleRotate(keyData) {
        setActionModal({ type: "rotate", keyData });
    }

    function handleRevoke(keyData) {
        setActionModal({ type: "revoke", keyData });
    }

    async function onConfirmAction(password) {
        if (!actionModal) return;
        const { type, keyData } = actionModal;

        if (type === "rotate") {
            await vm.rotateKey(keyData.keyId, password, CONFIG.PINATA_JWT);
        } else if (type === "revoke") {
            await vm.revokeKey(keyData.keyId);
        }

        // Refresh and update UI
        await vm.loadKeys();
        if (selectedKey?.keyId === keyData.keyId) {
            const updated = vm.keys.find((k) => k.keyId === keyData.keyId);
            if (updated) setSelectedKey(updated);
        }
        setActionModal(null);
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
            {/* Offline banner */}
            {!isOnline && (
                <div className="offline-banner">
                    <span style={{ marginRight: 8 }}>⚠️</span>
                    You are currently offline. Some features may be limited.
                </div>
            )}

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

            {/* Action modal (Rotate/Revoke) */}
            {actionModal && (
                <ActionModal
                    type={actionModal.type}
                    keyData={actionModal.keyData}
                    onClose={() => setActionModal(null)}
                    onConfirm={onConfirmAction}
                />
            )}

            {/* Header with tabs */}
            <header className="header">
                <div className="header-inner">
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
                <div className={`tab-content ${activeTab === "docs" ? "tab-content-active" : "tab-content-hidden"}`}>
                    <DocsPage onBack={() => { setActiveTab("home"); window.scrollTo(0, 0); }} />
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

            <footer className="footer">
                <div className="footer-grid">
                    {/* Column 1: Brand */}
                    <div className="footer-col">
                        <div className="footer-brand">
                            <div className="header-brand-icon" style={{ width: 20, height: 20 }}>
                                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            </div>
                            Blockchain KMS
                        </div>
                        <p className="footer-copyright">© 2026 Blockchain KMS. All rights reserved.</p>
                    </div>

                    {/* Column 2: Navigation */}
                    <div className="footer-col">
                        <h4 className="footer-heading">Application</h4>
                        <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("home"); window.scrollTo(0, 0); }} className="footer-link">Dashboard</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("playground"); window.scrollTo(0, 0); }} className="footer-link">Playground</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); setShowRegister(true); }} className="footer-link">Register Key</a>
                    </div>

                    {/* Column 3: Resources */}
                    <div className="footer-col">
                        <h4 className="footer-heading">Resources</h4>
                        <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("docs"); window.scrollTo(0, 0); }} className="footer-link">Documentation</a>
                        <a href="https://github.com/dormeneur/Key-Management-System-Blockchain" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub Repository ↗</a>
                    </div>

                    {/* Column 4: Status */}
                    <div className="footer-col">
                        <h4 className="footer-heading">System Status</h4>
                        <div className="footer-status-row">
                            <span className={`status-dot ${!isOnline ? "status-offline" : signer ? "status-online" : "status-offline"}`}></span>
                            <span>{!isOnline ? "Offline" : signer ? "Systems Operational" : "Wallet Disconnected"}</span>
                        </div>
                        {signer && (
                            <div className="footer-network-info">
                                <span className="network-label">Network</span>
                                <span className="network-value">Sepolia Testnet</span>
                            </div>
                        )}
                        <div className="footer-version">v1.2.0-stable</div>
                    </div>
                </div>
            </footer>
        </>
    );
}
