// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title KeyLifecycleManager
 * @notice Manages cryptographic-key lifecycle on-chain (register, rotate, revoke).
 *         Encrypted key material is stored off-chain on IPFS; only the CID pointer
 *         and lifecycle state live here, providing an immutable audit trail.
 */
contract KeyLifecycleManager is ReentrancyGuard {

    // ───────── Enums ─────────
    enum KeyState { ACTIVE, REVOKED }

    // ───────── Structs ─────────
    struct KeyMetadata {
        string  ipfsCID;
        KeyState state;
        uint256 registeredAt;
        uint256 rotatedAt;
        address owner;
        bool    exists;
    }

    // ───────── Events ─────────
    event KeyRegistered(
        bytes32 indexed keyId,
        string  ipfsCID,
        address indexed owner,
        uint256 timestamp
    );

    event KeyRotated(
        bytes32 indexed keyId,
        string  newIpfsCID,
        uint256 timestamp
    );

    event KeyRevoked(
        bytes32 indexed keyId,
        address indexed owner,
        uint256 timestamp
    );

    // ───────── Custom Errors ─────────
    error KeyAlreadyExists();
    error KeyNotExists();
    error Unauthorized();
    error KeyAlreadyRevoked();
    error InvalidIpfsCID();

    // ───────── State ─────────
    mapping(bytes32 => KeyMetadata) private _keys;
    mapping(address => bytes32[])   private _userKeys;

    // ───────── Modifiers ─────────
    modifier onlyKeyOwner(bytes32 keyId) {
        if (!_keys[keyId].exists)            revert KeyNotExists();
        if (_keys[keyId].owner != msg.sender) revert Unauthorized();
        _;
    }

    // ───────── External Functions ─────────

    /**
     * @notice Register a new key with its IPFS CID.
     * @param keyId   keccak256 hash of the key name
     * @param ipfsCID Content Identifier of the encrypted key blob on IPFS
     */
    function registerKey(bytes32 keyId, string calldata ipfsCID)
        external
        nonReentrant
    {
        if (_keys[keyId].exists)       revert KeyAlreadyExists();
        if (bytes(ipfsCID).length == 0) revert InvalidIpfsCID();

        _keys[keyId] = KeyMetadata({
            ipfsCID:      ipfsCID,
            state:        KeyState.ACTIVE,
            registeredAt: block.timestamp,
            rotatedAt:    0,
            owner:        msg.sender,
            exists:       true
        });

        _userKeys[msg.sender].push(keyId);

        emit KeyRegistered(keyId, ipfsCID, msg.sender, block.timestamp);
    }

    /**
     * @notice Rotate an existing ACTIVE key by updating its IPFS CID.
     * @param keyId     The key to rotate
     * @param newIpfsCID New Content Identifier on IPFS
     */
    function rotateKey(bytes32 keyId, string calldata newIpfsCID)
        external
        nonReentrant
        onlyKeyOwner(keyId)
    {
        if (_keys[keyId].state == KeyState.REVOKED) revert KeyAlreadyRevoked();
        if (bytes(newIpfsCID).length == 0)           revert InvalidIpfsCID();

        _keys[keyId].ipfsCID   = newIpfsCID;
        _keys[keyId].rotatedAt = block.timestamp;

        emit KeyRotated(keyId, newIpfsCID, block.timestamp);
    }

    /**
     * @notice Revoke an ACTIVE key. Irreversible.
     * @param keyId The key to revoke
     */
    function revokeKey(bytes32 keyId)
        external
        nonReentrant
        onlyKeyOwner(keyId)
    {
        if (_keys[keyId].state == KeyState.REVOKED) revert KeyAlreadyRevoked();

        _keys[keyId].state = KeyState.REVOKED;

        emit KeyRevoked(keyId, msg.sender, block.timestamp);
    }

    // ───────── View Functions ─────────

    /**
     * @notice Retrieve metadata for a specific key.
     */
    function getKeyMetadata(bytes32 keyId)
        external
        view
        returns (
            string  memory ipfsCID,
            KeyState       state,
            uint256        registeredAt,
            uint256        rotatedAt,
            address        owner
        )
    {
        if (!_keys[keyId].exists) revert KeyNotExists();
        KeyMetadata storage k = _keys[keyId];
        return (k.ipfsCID, k.state, k.registeredAt, k.rotatedAt, k.owner);
    }

    /**
     * @notice Get all key IDs owned by an address.
     */
    function getUserKeys(address user)
        external
        view
        returns (bytes32[] memory)
    {
        return _userKeys[user];
    }
}
