/**
 * KeyModel — pure data class for key metadata.
 */
export class KeyMetadata {
    /**
     * @param {string}  keyId        bytes32 hex
     * @param {string}  name         human-readable name (derived client-side)
     * @param {string}  ipfsCID      IPFS content identifier
     * @param {number}  state        0 = ACTIVE, 1 = REVOKED
     * @param {string}  owner        Ethereum address
     * @param {number}  registeredAt Unix timestamp
     * @param {number}  rotatedAt    Unix timestamp (0 if never rotated)
     */
    constructor(keyId, name, ipfsCID, state, owner, registeredAt, rotatedAt) {
        this.keyId = keyId;
        this.name = name;
        this.ipfsCID = ipfsCID;
        this.state = Number(state);
        this.owner = owner;
        this.registeredAt = Number(registeredAt);
        this.rotatedAt = Number(rotatedAt);
    }

    get isActive() {
        return this.state === 0;
    }

    get stateLabel() {
        return ["ACTIVE", "REVOKED"][this.state] ?? "UNKNOWN";
    }

    get registeredDate() {
        return new Date(this.registeredAt * 1000);
    }

    get rotatedDate() {
        return this.rotatedAt ? new Date(this.rotatedAt * 1000) : null;
    }
}
