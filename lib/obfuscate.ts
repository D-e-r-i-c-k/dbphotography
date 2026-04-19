import crypto from "crypto";

// Ensure we have a valid secret, use a fallback for local dev if absolutely necessary
// though DOWNLOAD_TOKEN_SECRET should be defined in .env.local
const secret = process.env.DOWNLOAD_TOKEN_SECRET || "default_local_secret_must_be_32_bytes_long";

// If the secret is a hex string of 64 chars, parse it as hex to get 32 bytes
// Otherwise, just hash it to ensure we always have exactly 32 bytes for aes-256-cbc
const key = secret.length === 64
    ? Buffer.from(secret, "hex")
    : crypto.createHash('sha256').update(secret).digest();

/**
 * Encrypts a string (e.g., a Sanity CDN URL) into a URL-safe format.
 * Uses a deterministic IV so that the same URL always produces the same encrypted string,
 * which is critical for Next.js and browser image caching.
 */
export function encryptUrl(text: string): string {
    // Generate a deterministic 16-byte IV based on the input text
    const iv = crypto.createHash("md5").update(text).digest();
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const payload = `${iv.toString("hex")}:${encrypted}`;
    // Return base64url encoded string to be safe in URL query params
    return Buffer.from(payload).toString("base64url");
}

/**
 * Decrypts a URL-safe encrypted string back to the original string
 */
export function decryptUrl(encryptedTextBase64: string): string | null {
    try {
        const payload = Buffer.from(encryptedTextBase64, "base64url").toString("utf8");
        const parts = payload.split(":");
        if (parts.length !== 2) return null;

        const iv = Buffer.from(parts[0], "hex");
        const encryptedText = parts[1];

        const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
        let decrypted = decipher.update(encryptedText, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch (e) {
        console.error("URL decryption failed:", e);
        return null;
    }
}
