/**
 * IPFSService — upload/fetch encrypted blobs via Pinata.
 *
 * Uses the Pinata Files API (uploads.pinata.cloud) which works
 * reliably with both admin and scoped API keys.
 */

const PINATA_UPLOAD_URL = "https://uploads.pinata.cloud/v3/files";
const PINATA_LEGACY_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs";

/**
 * Upload a JSON object to IPFS via Pinata Files API (v3).
 * Falls back to legacy pinning API if v3 fails.
 *
 * @param {object} jsonData   The encrypted blob JSON
 * @param {string} pinataJWT  Your Pinata JWT token
 * @returns {string} IPFS CID
 */
export async function uploadJSON(jsonData, pinataJWT) {
    // Try Files API v3 first (multipart upload)
    try {
        const blob = new Blob([JSON.stringify(jsonData)], { type: "application/json" });
        const formData = new FormData();
        formData.append("file", blob, `kms-key-${Date.now()}.json`);
        formData.append("network", "public");

        const res = await fetch(PINATA_UPLOAD_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${pinataJWT}`,
            },
            body: formData,
        });

        if (res.ok) {
            const result = await res.json();
            // v3 returns { data: { cid: "..." } }
            return result.data?.cid || result.data?.IpfsHash;
        }
    } catch (err) {
        // Check if it's a network error
        if (err.message.includes("Failed to fetch") || err.message.includes("offline")) {
            throw new Error("Network error: Unable to reach IPFS. Please check your internet connection.");
        }
        // Fall through to legacy API
    }

    // Fallback: legacy pinning API
    try {
        const res = await fetch(PINATA_LEGACY_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${pinataJWT}`,
            },
            body: JSON.stringify({
                pinataContent: jsonData,
                pinataMetadata: { name: `kms-key-${Date.now()}` },
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Pinata upload failed: ${err}`);
        }

        const { IpfsHash } = await res.json();
        return IpfsHash;
    } catch (err) {
        if (err.message.includes("Failed to fetch")) {
            throw new Error("Network error: Unable to reach IPFS. Please check your internet connection.");
        }
        throw err;
    }
}

/**
 * Fetch a JSON blob from IPFS via the Pinata gateway.
 *
 * @param {string} cid  Content Identifier
 * @returns {object} Parsed JSON
 */
export async function fetchJSON(cid) {
    try {
        const res = await fetch(`${IPFS_GATEWAY}/${cid}`);
        if (!res.ok) throw new Error(`IPFS fetch failed (CID: ${cid})`);
        return res.json();
    } catch (err) {
        if (err.message.includes("Failed to fetch")) {
            throw new Error("Network error: Unable to fetch from IPFS. Please check your internet connection.");
        }
        throw err;
    }
}

/**
 * Get a clickable IPFS gateway URL for a CID.
 */
export function gatewayURL(cid) {
    return `${IPFS_GATEWAY}/${cid}`;
}
