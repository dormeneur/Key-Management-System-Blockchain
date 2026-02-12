/**
 * EncryptionService — AES-256-GCM encryption using the Web Crypto API.
 *
 * Workflow:
 *   1. Derive a 256-bit key from the user's password via PBKDF2.
 *   2. Encrypt the random key material with AES-GCM.
 *   3. Bundle { ciphertext, iv, salt, metadata } as JSON → ready for IPFS.
 */

const PBKDF2_ITERATIONS = 100_000;

// ── helpers ──────────────────────────────────────────────────

function buf2b64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function b642buf(base64) {
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
}

// ── core ─────────────────────────────────────────────────────

/**
 * Derive an AES-256-GCM CryptoKey from a password + salt.
 */
async function deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt,
            iterations: PBKDF2_ITERATIONS,
            hash: "SHA-256",
        },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

/**
 * Generate a random 256-bit key, encrypt it with AES-GCM, and return
 * a JSON-serialisable bundle ready for IPFS upload.
 *
 * @param {string} password  User-supplied password
 * @param {string} keyName   Human-readable name of the key
 * @returns {{ encryptedBlob: object, rawKeyBase64: string }}
 */
export async function encryptNewKey(password, keyName = "Unnamed Key") {
    // 1. Generate random 32-byte key material
    const rawKey = crypto.getRandomValues(new Uint8Array(32));

    // 2. Random salt & IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // 3. Derive encryption key from password
    const aesKey = await deriveKey(password, salt);

    // 4. Encrypt (AES-GCM appends the auth tag to the ciphertext)
    const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        aesKey,
        rawKey
    );

    const encryptedBlob = {
        version: "1.0",
        algorithm: "AES-256-GCM",
        ciphertext: buf2b64(ciphertext),
        iv: buf2b64(iv),
        salt: buf2b64(salt),
        metadata: {
            createdAt: Math.floor(Date.now() / 1000),
            keyType: "symmetric",
            name: keyName,
        },
    };

    return {
        encryptedBlob,
        rawKeyBase64: buf2b64(rawKey), // only shown to user once
    };
}

/**
 * Decrypt a previously encrypted key blob using the user's password.
 *
 * @param {object} encryptedBlob  The JSON from IPFS
 * @param {string} password
 * @returns {string} Raw key material as base-64
 */
export async function decryptKey(encryptedBlob, password) {
    const salt = new Uint8Array(b642buf(encryptedBlob.salt));
    const iv = new Uint8Array(b642buf(encryptedBlob.iv));
    const ciphertext = b642buf(encryptedBlob.ciphertext);

    const aesKey = await deriveKey(password, salt);
    const rawKey = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        aesKey,
        ciphertext
    );

    return buf2b64(rawKey);
}

// ── Message encryption with raw KMS key (for Playground) ────

/**
 * Import a raw base64 key as a CryptoKey for AES-GCM.
 */
async function importRawKey(rawKeyBase64) {
    const keyData = b642buf(rawKeyBase64);
    return crypto.subtle.importKey(
        "raw", keyData, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]
    );
}

/**
 * Encrypt a plaintext message using a raw AES-256 key from the KMS.
 *
 * @param {string}  plaintext       The message to encrypt
 * @param {string}  rawKeyBase64    The decrypted raw key (base64)
 * @returns {{ ciphertext, iv, algorithm }}
 */
export async function encryptWithKey(plaintext, rawKeyBase64) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const aesKey = await importRawKey(rawKeyBase64);

    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        aesKey,
        new TextEncoder().encode(plaintext)
    );

    return {
        ciphertext: buf2b64(encrypted),
        iv: buf2b64(iv),
        algorithm: "AES-256-GCM",
    };
}

/**
 * Decrypt a ciphertext bundle using a raw AES-256 key from the KMS.
 *
 * @param {{ ciphertext, iv }} bundle
 * @param {string}  rawKeyBase64   The decrypted raw key (base64)
 * @returns {string} Original plaintext
 */
export async function decryptWithKey(bundle, rawKeyBase64) {
    const iv = new Uint8Array(b642buf(bundle.iv));
    const ciphertext = b642buf(bundle.ciphertext);
    const aesKey = await importRawKey(rawKeyBase64);

    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        aesKey,
        ciphertext
    );

    return new TextDecoder().decode(decrypted);
}

