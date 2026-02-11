/**
 * KeyLifecycleService — wraps ethers.js contract calls.
 */
import { ethers } from "ethers";
import ABI from "../constants/abi.json";

export class KeyLifecycleService {
    /**
     * @param {ethers.Signer} signer  Connected signer from MetaMask
     * @param {string} contractAddress
     */
    constructor(signer, contractAddress) {
        this.signer = signer;
        this.contract = new ethers.Contract(contractAddress, ABI, signer);
    }

    /**
     * Hash a human-readable key name into a bytes32 keyId.
     */
    static nameToId(keyName) {
        return ethers.keccak256(ethers.toUtf8Bytes(keyName));
    }

    // ── Write functions ────────────────────────────────────────

    async registerKey(keyId, ipfsCID) {
        const tx = await this.contract.registerKey(keyId, ipfsCID);
        const receipt = await tx.wait();
        return receipt;
    }

    async rotateKey(keyId, newIpfsCID) {
        const tx = await this.contract.rotateKey(keyId, newIpfsCID);
        const receipt = await tx.wait();
        return receipt;
    }

    async revokeKey(keyId) {
        const tx = await this.contract.revokeKey(keyId);
        const receipt = await tx.wait();
        return receipt;
    }

    // ── Read functions ─────────────────────────────────────────

    async getKeyMetadata(keyId) {
        const [ipfsCID, state, registeredAt, rotatedAt, owner] =
            await this.contract.getKeyMetadata(keyId);
        return { ipfsCID, state, registeredAt, rotatedAt, owner };
    }

    async getUserKeys(address) {
        return this.contract.getUserKeys(address);
    }

    // ── Event queries ──────────────────────────────────────────

    /**
     * Fetch all lifecycle events for a given keyId.
     * Returns an array of { eventName, args, blockNumber, transactionHash }.
     */
    async getKeyEvents(keyId) {
        const filters = [
            this.contract.filters.KeyRegistered(keyId),
            this.contract.filters.KeyRotated(keyId),
            this.contract.filters.KeyRevoked(keyId),
        ];

        const allEvents = [];
        for (const filter of filters) {
            const events = await this.contract.queryFilter(filter, 0, "latest");
            for (const ev of events) {
                allEvents.push({
                    eventName: ev.fragment.name,
                    args: ev.args,
                    blockNumber: ev.blockNumber,
                    transactionHash: ev.transactionHash,
                });
            }
        }

        // Sort by block number
        allEvents.sort((a, b) => a.blockNumber - b.blockNumber);
        return allEvents;
    }
}
