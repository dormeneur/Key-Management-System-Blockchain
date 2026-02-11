const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("KeyLifecycleManager", function () {
    let manager;
    let owner, other;
    const KEY_NAME = "MyTestKey";
    let keyId;
    const IPFS_CID = "QmTestCID123456789abcdef";
    const NEW_CID = "QmNewCID987654321zyxwvu";

    beforeEach(async function () {
        [owner, other] = await ethers.getSigners();
        const Factory = await ethers.getContractFactory("KeyLifecycleManager");
        manager = await Factory.deploy();
        await manager.waitForDeployment();
        keyId = ethers.keccak256(ethers.toUtf8Bytes(KEY_NAME));
    });

    // ─── Register ─────────────────────────────────────────────
    describe("registerKey", function () {
        it("should register a new key and emit KeyRegistered", async function () {
            const tx = await manager.registerKey(keyId, IPFS_CID);
            const receipt = await tx.wait();

            // Check event
            await expect(tx)
                .to.emit(manager, "KeyRegistered")
                .withArgs(keyId, IPFS_CID, owner.address, (val) => val > 0n);

            // Check stored metadata
            const [cid, state, registeredAt, rotatedAt, keyOwner] =
                await manager.getKeyMetadata(keyId);
            expect(cid).to.equal(IPFS_CID);
            expect(state).to.equal(0n); // ACTIVE
            expect(registeredAt).to.be.gt(0n);
            expect(rotatedAt).to.equal(0n);
            expect(keyOwner).to.equal(owner.address);
        });

        it("should add keyId to the user's key list", async function () {
            await manager.registerKey(keyId, IPFS_CID);
            const keys = await manager.getUserKeys(owner.address);
            expect(keys).to.include(keyId);
        });

        it("should revert when registering a duplicate keyId", async function () {
            await manager.registerKey(keyId, IPFS_CID);
            await expect(manager.registerKey(keyId, IPFS_CID))
                .to.be.revertedWithCustomError(manager, "KeyAlreadyExists");
        });

        it("should revert when IPFS CID is empty", async function () {
            await expect(manager.registerKey(keyId, ""))
                .to.be.revertedWithCustomError(manager, "InvalidIpfsCID");
        });
    });

    // ─── Rotate ───────────────────────────────────────────────
    describe("rotateKey", function () {
        beforeEach(async function () {
            await manager.registerKey(keyId, IPFS_CID);
        });

        it("should rotate key and emit KeyRotated", async function () {
            const tx = await manager.rotateKey(keyId, NEW_CID);
            await expect(tx)
                .to.emit(manager, "KeyRotated")
                .withArgs(keyId, NEW_CID, (val) => val > 0n);

            const [cid, , , rotatedAt] = await manager.getKeyMetadata(keyId);
            expect(cid).to.equal(NEW_CID);
            expect(rotatedAt).to.be.gt(0n);
        });

        it("should revert when non-owner tries to rotate", async function () {
            await expect(manager.connect(other).rotateKey(keyId, NEW_CID))
                .to.be.revertedWithCustomError(manager, "Unauthorized");
        });

        it("should revert when key does not exist", async function () {
            const fakeId = ethers.keccak256(ethers.toUtf8Bytes("nonexistent"));
            await expect(manager.rotateKey(fakeId, NEW_CID))
                .to.be.revertedWithCustomError(manager, "KeyNotExists");
        });

        it("should revert when new CID is empty", async function () {
            await expect(manager.rotateKey(keyId, ""))
                .to.be.revertedWithCustomError(manager, "InvalidIpfsCID");
        });

        it("should revert when key is already revoked", async function () {
            await manager.revokeKey(keyId);
            await expect(manager.rotateKey(keyId, NEW_CID))
                .to.be.revertedWithCustomError(manager, "KeyAlreadyRevoked");
        });
    });

    // ─── Revoke ───────────────────────────────────────────────
    describe("revokeKey", function () {
        beforeEach(async function () {
            await manager.registerKey(keyId, IPFS_CID);
        });

        it("should revoke key and emit KeyRevoked", async function () {
            const tx = await manager.revokeKey(keyId);
            await expect(tx)
                .to.emit(manager, "KeyRevoked")
                .withArgs(keyId, owner.address, (val) => val > 0n);

            const [, state] = await manager.getKeyMetadata(keyId);
            expect(state).to.equal(1n); // REVOKED
        });

        it("should revert when non-owner tries to revoke", async function () {
            await expect(manager.connect(other).revokeKey(keyId))
                .to.be.revertedWithCustomError(manager, "Unauthorized");
        });

        it("should revert when revoking an already-revoked key", async function () {
            await manager.revokeKey(keyId);
            await expect(manager.revokeKey(keyId))
                .to.be.revertedWithCustomError(manager, "KeyAlreadyRevoked");
        });
    });

    // ─── View helpers ─────────────────────────────────────────
    describe("getKeyMetadata", function () {
        it("should revert for a non-existent key", async function () {
            const fakeId = ethers.keccak256(ethers.toUtf8Bytes("ghost"));
            await expect(manager.getKeyMetadata(fakeId))
                .to.be.revertedWithCustomError(manager, "KeyNotExists");
        });
    });

    describe("getUserKeys", function () {
        it("should return empty array for user with no keys", async function () {
            const keys = await manager.getUserKeys(other.address);
            expect(keys).to.have.lengthOf(0);
        });

        it("should return multiple keys for same user", async function () {
            const id2 = ethers.keccak256(ethers.toUtf8Bytes("SecondKey"));
            await manager.registerKey(keyId, IPFS_CID);
            await manager.registerKey(id2, IPFS_CID);
            const keys = await manager.getUserKeys(owner.address);
            expect(keys).to.have.lengthOf(2);
        });
    });
});
