/**
 * useKeyLifecycle — React ViewModel hook.
 *
 * Orchestrates: encryption → IPFS upload → contract call → state refresh.
 */
import { useReducer, useCallback } from "react";
import { KeyMetadata } from "../models/KeyModel";
import { KeyLifecycleService } from "../services/KeyLifecycleService";
import { encryptNewKey } from "../services/EncryptionService";
import { uploadJSON } from "../services/IPFSService";

// ── Reducer ──────────────────────────────────────────────────

const initialState = {
    keys: [],
    loading: false,
    error: null,
    txHash: null,
    status: "", // human-readable loading step
};

function reducer(state, action) {
    switch (action.type) {
        case "LOADING":
            return { ...state, loading: true, error: null, status: action.status || "Loading…" };
        case "KEYS_LOADED":
            return { ...state, keys: action.keys, loading: false, status: "" };
        case "TX_SUCCESS":
            return { ...state, txHash: action.txHash, loading: false, status: "" };
        case "ERROR":
            return { ...state, loading: false, error: action.message, status: "" };
        case "CLEAR_ERROR":
            return { ...state, error: null };
        case "CLEAR_TX":
            return { ...state, txHash: null };
        default:
            return state;
    }
}

// ── Hook ─────────────────────────────────────────────────────

/**
 * @param {import("ethers").Signer | null} signer
 * @param {string} contractAddress
 * @param {Object} keyNames  Map of keyId -> human name (stored in localStorage)
 */
export function useKeyLifecycle(signer, contractAddress, keyNames = {}) {
    const [state, dispatch] = useReducer(reducer, initialState);

    // ── Load all keys for the connected wallet ────────────────
    const loadKeys = useCallback(async () => {
        if (!signer || !contractAddress) return;
        dispatch({ type: "LOADING", status: "Loading keys…" });
        try {
            const service = new KeyLifecycleService(signer, contractAddress);
            const address = await signer.getAddress();
            const keyIds = await service.getUserKeys(address);

            const keys = [];
            for (const id of keyIds) {
                const meta = await service.getKeyMetadata(id);
                keys.push(
                    new KeyMetadata(
                        id,
                        keyNames[id] || id.slice(0, 10) + "…",
                        meta.ipfsCID,
                        meta.state,
                        meta.owner,
                        meta.registeredAt,
                        meta.rotatedAt
                    )
                );
            }
            dispatch({ type: "KEYS_LOADED", keys });
        } catch (err) {
            dispatch({ type: "ERROR", message: err.message });
        }
    }, [signer, contractAddress, keyNames]);

    // ── Register ──────────────────────────────────────────────
    const registerKey = useCallback(
        async (keyName, password, pinataJWT) => {
            if (!signer) return;
            try {
                // Step 1: Encrypt
                dispatch({ type: "LOADING", status: "Encrypting key…" });
                const { encryptedBlob } = await encryptNewKey(password);

                // Step 2: Upload to IPFS
                dispatch({ type: "LOADING", status: "Uploading to IPFS…" });
                const cid = await uploadJSON(encryptedBlob, pinataJWT);

                // Step 3: On-chain registration
                dispatch({ type: "LOADING", status: "Confirming transaction…" });
                const keyId = KeyLifecycleService.nameToId(keyName);
                const service = new KeyLifecycleService(signer, contractAddress);
                const receipt = await service.registerKey(keyId, cid);

                dispatch({ type: "TX_SUCCESS", txHash: receipt.hash });
                return { keyId, cid, txHash: receipt.hash };
            } catch (err) {
                dispatch({ type: "ERROR", message: err.message });
                throw err;
            }
        },
        [signer, contractAddress]
    );

    // ── Rotate ────────────────────────────────────────────────
    const rotateKey = useCallback(
        async (keyId, password, pinataJWT) => {
            if (!signer) return;
            try {
                dispatch({ type: "LOADING", status: "Encrypting new key…" });
                const { encryptedBlob } = await encryptNewKey(password);

                dispatch({ type: "LOADING", status: "Uploading to IPFS…" });
                const cid = await uploadJSON(encryptedBlob, pinataJWT);

                dispatch({ type: "LOADING", status: "Confirming transaction…" });
                const service = new KeyLifecycleService(signer, contractAddress);
                const receipt = await service.rotateKey(keyId, cid);

                dispatch({ type: "TX_SUCCESS", txHash: receipt.hash });
                return { cid, txHash: receipt.hash };
            } catch (err) {
                dispatch({ type: "ERROR", message: err.message });
                throw err;
            }
        },
        [signer, contractAddress]
    );

    // ── Revoke ────────────────────────────────────────────────
    const revokeKey = useCallback(
        async (keyId) => {
            if (!signer) return;
            try {
                dispatch({ type: "LOADING", status: "Revoking key…" });
                const service = new KeyLifecycleService(signer, contractAddress);
                const receipt = await service.revokeKey(keyId);

                dispatch({ type: "TX_SUCCESS", txHash: receipt.hash });
                return receipt.hash;
            } catch (err) {
                dispatch({ type: "ERROR", message: err.message });
                throw err;
            }
        },
        [signer, contractAddress]
    );

    // ── Event timeline ────────────────────────────────────────
    const getKeyEvents = useCallback(
        async (keyId) => {
            if (!signer) return [];
            const service = new KeyLifecycleService(signer, contractAddress);
            return service.getKeyEvents(keyId);
        },
        [signer, contractAddress]
    );

    const clearError = () => dispatch({ type: "CLEAR_ERROR" });
    const clearTx = () => dispatch({ type: "CLEAR_TX" });

    return {
        ...state,
        loadKeys,
        registerKey,
        rotateKey,
        revokeKey,
        getKeyEvents,
        clearError,
        clearTx,
    };
}
