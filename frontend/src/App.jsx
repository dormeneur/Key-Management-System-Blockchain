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

    // ── UI state ───────────────────────────────────────────────
    const [view, setView] = useState("dashboard"); // dashboard | detail
    const [showRegister, setShowRegister] = useState(false);
    const [selectedKey, setSelectedKey] = useState(null);
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
        setView("dashboard");
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
        setView("detail");
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

            {/* View router */}
            {view === "detail" && selectedKey ? (
                <KeyDetailView
                    keyData={selectedKey}
                    onBack={() => {
                        setView("dashboard");
                        setSelectedKey(null);
                        vm.loadKeys();
                    }}
                    onRotate={handleRotate}
                    onRevoke={handleRevoke}
                    getKeyEvents={vm.getKeyEvents}
                />
            ) : view === "playground" ? (
                <EncryptDecryptPlayground
                    onBack={() => setView("dashboard")}
                    walletAddress={walletAddress}
                    onDisconnect={disconnect}
                />
            ) : (
                <Dashboard
                    keys={vm.keys}
                    walletAddress={walletAddress}
                    onRegister={() => setShowRegister(true)}
                    onSelect={handleSelectKey}
                    onRotate={handleRotate}
                    onRevoke={handleRevoke}
                    onDisconnect={disconnect}
                    onPlayground={() => setView("playground")}
                />
            )}
        </>
    );
}
