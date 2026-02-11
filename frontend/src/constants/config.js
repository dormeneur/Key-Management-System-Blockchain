/**
 * constants/config.js — central configuration
 */
export const CONFIG = {
    CHAIN_ID: 11155111, // Sepolia
    CHAIN_NAME: "Sepolia Testnet",
    RPC_URL: import.meta.env.VITE_SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
    ETHERSCAN_BASE: "https://sepolia.etherscan.io",
    IPFS_GATEWAY: "https://gateway.pinata.cloud/ipfs",
    PINATA_JWT: import.meta.env.VITE_PINATA_JWT || "",
    CONTRACT_ADDRESS: import.meta.env.VITE_CONTRACT_ADDRESS || "",
};
