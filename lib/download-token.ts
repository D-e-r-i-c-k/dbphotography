import crypto from "crypto";

/* ------------------------------------------------------------------ */
/*  JWT-like download tokens using HMAC-SHA256                        */
/*  No external library — just Node.js crypto.                        */
/* ------------------------------------------------------------------ */

export interface DownloadTokenPayload {
    /** Cloudinary or Sanity image asset references with optional format */
    assets: { ref: string; title: string; format?: string }[];
    /** Buyer email address */
    email: string;
    /** Payment ID (for audit trail) */
    paymentId: string;
    /** Expiry timestamp (ms since epoch) */
    exp: number;
}

const ALG = "sha256";

function getSecret(): string {
    const secret = process.env.DOWNLOAD_TOKEN_SECRET;
    if (!secret) throw new Error("DOWNLOAD_TOKEN_SECRET is not set");
    return secret;
}

function base64url(input: string | Buffer): string {
    const buf = typeof input === "string" ? Buffer.from(input) : input;
    return buf.toString("base64url");
}

function sign(payload: string): string {
    return crypto
        .createHmac(ALG, getSecret())
        .update(payload)
        .digest("base64url");
}

/**
 * Create a signed download token.
 * Encodes purchased assets + buyer email into a compact, URL-safe string
 * that expires after `ttlHours` (default 72).
 */
export function createDownloadToken(
    assets: { ref: string; title: string; format?: string }[],
    email: string,
    paymentId: string,
    ttlHours = 72
): string {
    const payload: DownloadTokenPayload = {
        assets,
        email,
        paymentId,
        exp: Date.now() + ttlHours * 60 * 60 * 1000,
    };

    const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const body = base64url(JSON.stringify(payload));
    const signature = sign(`${header}.${body}`);

    return `${header}.${body}.${signature}`;
}

/**
 * Verify and decode a download token.
 * Throws descriptive errors on failure.
 */
export function verifyDownloadToken(token: string): DownloadTokenPayload {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid token format");

    const [header, body, sig] = parts;
    const expectedSig = sign(`${header}.${body}`);

    if (sig !== expectedSig) throw new Error("Invalid token signature");

    const payload = JSON.parse(
        Buffer.from(body, "base64url").toString()
    ) as DownloadTokenPayload;

    if (Date.now() > payload.exp) {
        throw new Error("Download link has expired");
    }

    return payload;
}
