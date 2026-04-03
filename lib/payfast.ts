import crypto from "crypto";

/* ------------------------------------------------------------------ */
/*  PayFast configuration                                             */
/* ------------------------------------------------------------------ */

const SANDBOX_HOST = "sandbox.payfast.co.za";
const PRODUCTION_HOST = "www.payfast.co.za";

/** Use sandbox when merchant_id is one of the well-known test values. */
function isSandbox(): boolean {
    const id = process.env.PAYFAST_MERCHANT_ID ?? "";
    return id === "10000100" || id === "10004002";
}

export function getPayFastUrl(): string {
    return `https://${isSandbox() ? SANDBOX_HOST : PRODUCTION_HOST}/eng/process`;
}

/* ------------------------------------------------------------------ */
/*  Signature generation                                              */
/* ------------------------------------------------------------------ */

/**
 * The EXACT field order PayFast requires for checkout form signatures.
 * From: https://developers.payfast.co.za/docs#step_1_form_fields
 *
 * Only fields present in the data object will be included.
 * Fields NOT in this list are appended at the end (future-proofing).
 */
const PAYFAST_FIELD_ORDER = [
    // Merchant details
    "merchant_id",
    "merchant_key",
    // URLs
    "return_url",
    "cancel_url",
    "notify_url",
    // Buyer details
    "name_first",
    "name_last",
    "email_address",
    "cell_number",
    // Transaction details
    "m_payment_id",
    "amount",
    "item_name",
    "item_description",
    // Custom fields
    "custom_int1",
    "custom_int2",
    "custom_int3",
    "custom_int4",
    "custom_int5",
    "custom_str1",
    "custom_str2",
    "custom_str3",
    "custom_str4",
    "custom_str5",
    // Payment options
    "email_confirmation",
    "confirmation_address",
    "payment_method",
    // Subscription fields
    "subscription_type",
    "billing_date",
    "recurring_amount",
    "frequency",
    "cycles",
    "subscription_notify_email",
    "subscription_notify_webhook",
    "subscription_notify_buyer",
];

/**
 * PayFast-compatible URL encoding that matches PHP's urlencode().
 *
 * PHP's urlencode():
 *   - Encodes spaces as "+"
 *   - Encodes everything else per RFC 3986 EXCEPT letters, digits, "-", "_", "."
 *   - Uses uppercase hex digits (%2F not %2f)
 *
 * JavaScript's encodeURIComponent():
 *   - Encodes spaces as "%20"
 *   - Does NOT encode: A-Z a-z 0-9 - _ . ! ~ * ' ( )
 *
 * So we need to:
 *   1. Use encodeURIComponent
 *   2. Replace %20 → +
 *   3. Encode the chars that JS leaves alone but PHP encodes: ! ' ( ) * ~
 *   4. Keep hex digits uppercase
 */
function phpUrlEncode(value: string): string {
    return encodeURIComponent(value.trim())
        .replace(/%20/g, "+")
        .replace(/!/g, "%21")
        .replace(/'/g, "%27")
        .replace(/\(/g, "%28")
        .replace(/\)/g, "%29")
        .replace(/\*/g, "%2A")
        .replace(/~/g, "%7E")
        .replace(/%[0-9a-f]{2}/gi, (match) => match.toUpperCase());
}

/**
 * Build the MD5 signature that PayFast expects for checkout form POSTs.
 *
 * IMPORTANT — PayFast docs state:
 *   "Do NOT use alphabetical ordering; use the documented field order."
 *
 * Steps:
 * 1. Sort fields in DOCUMENTED order (see PAYFAST_FIELD_ORDER).
 * 2. Build param string: key=urlencode(value) joined by "&", skip blanks.
 * 3. If a passphrase is configured, append "&passphrase=urlencode(passphrase)".
 * 4. MD5 hash the whole thing.
 */
export function generateSignature(
    data: Record<string, string>,
    passphrase?: string
): string {
    // Order keys per PayFast's documented order
    const orderedKeys = getOrderedKeys(data);

    // Build the param string (skip empty values)
    const paramString = orderedKeys
        .filter((k) => data[k] !== "" && data[k] !== undefined && data[k] !== null)
        .map((k) => `${k}=${phpUrlEncode(data[k])}`)
        .join("&");

    // Append passphrase if set
    const toHash = passphrase
        ? `${paramString}&passphrase=${phpUrlEncode(passphrase)}`
        : paramString;

    return crypto.createHash("md5").update(toHash).digest("hex");
}

/**
 * Return the keys of `data` sorted in PayFast's documented order.
 * Any keys not in PAYFAST_FIELD_ORDER are placed at the end in
 * the order they appear in the data object.
 */
function getOrderedKeys(data: Record<string, string>): string[] {
    const dataKeys = new Set(Object.keys(data));
    const ordered: string[] = [];

    // First: known fields in documented order
    for (const key of PAYFAST_FIELD_ORDER) {
        if (dataKeys.has(key)) {
            ordered.push(key);
            dataKeys.delete(key);
        }
    }

    // Then: any remaining fields (future-proofing)
    for (const key of dataKeys) {
        ordered.push(key);
    }

    return ordered;
}

/* ------------------------------------------------------------------ */
/*  Build payment form data                                           */
/* ------------------------------------------------------------------ */

export interface PaymentItem {
    title: string;
    price: number;
}

export interface PaymentFormData {
    /** The complete set of form fields (including signature). */
    fields: Record<string, string>;
    /** The PayFast URL to POST the form to. */
    actionUrl: string;
}

/**
 * Build the full set of form fields for a PayFast payment.
 *
 * @param paymentId - Unique reference for this payment (e.g. UUID).
 * @param items     - Cart items (title + price in ZAR).
 * @param returnUrl - Where to redirect after success.
 * @param cancelUrl - Where to redirect if cancelled.
 * @param notifyUrl - Webhook URL for ITN.
 * @param buyerEmail - Optional buyer email.
 */
export function buildPaymentData(
    paymentId: string,
    items: PaymentItem[],
    returnUrl: string,
    cancelUrl: string,
    notifyUrl: string,
    buyerEmail?: string
): PaymentFormData {
    const merchantId = process.env.PAYFAST_MERCHANT_ID ?? "";
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY ?? "";
    const passphrase = process.env.PAYFAST_PASSPHRASE || "";

    const total = items.reduce((sum, item) => sum + item.price, 0);
    const itemName =
        items.length === 1
            ? items[0].title
            : `${items.length} photos`;

    // Build data object in PayFast's documented field order
    const data: Record<string, string> = {
        merchant_id: merchantId,
        merchant_key: merchantKey,
        return_url: returnUrl,
        cancel_url: cancelUrl,
        notify_url: notifyUrl,
    };

    // Buyer details come between notify_url and m_payment_id
    if (buyerEmail) {
        data.email_address = buyerEmail;
    }

    data.m_payment_id = paymentId;
    data.amount = total.toFixed(2);
    data.item_name = itemName;

    // Generate signature (passphrase only if it's non-empty)
    const signature = generateSignature(data, passphrase || undefined);

    return {
        fields: { ...data, signature },
        actionUrl: getPayFastUrl(),
    };
}

/* ------------------------------------------------------------------ */
/*  ITN (Instant Transaction Notification) validation                 */
/* ------------------------------------------------------------------ */

/**
 * Validate an incoming ITN from PayFast.
 * Returns true if the signature is valid.
 *
 * For ITN validation, PayFast sends the fields in their own order
 * and the signature is computed from that order (excluding the
 * signature field itself).
 */
export function validateITNSignature(
    body: Record<string, string>
): boolean {
    const passphrase = process.env.PAYFAST_PASSPHRASE || "";

    // Extract signature; keep the rest in their original order
    const { signature: receivedSig, ...rest } = body;

    // Build param string from all fields EXCEPT "signature",
    // preserving the order PayFast sent them in.
    const paramString = Object.entries(rest)
        .filter(([, v]) => v !== "" && v !== undefined)
        .map(([k, v]) => `${k}=${phpUrlEncode(v)}`)
        .join("&");

    const toHash = passphrase
        ? `${paramString}&passphrase=${phpUrlEncode(passphrase)}`
        : paramString;

    const expectedSig = crypto.createHash("md5").update(toHash).digest("hex");

    return expectedSig === receivedSig;
}

/* ------------------------------------------------------------------ */
/*  PayFast server IP validation                                      */
/* ------------------------------------------------------------------ */

/**
 * PayFast's known server IPs that send ITN notifications.
 * See: https://developers.payfast.co.za/docs#step_4_confirm_payment
 */
const PAYFAST_VALID_IPS = [
    "197.97.145.144",
    "197.97.145.145",
    "197.97.145.146",
    "197.97.145.147",
    "197.97.145.148",
    "197.97.145.149",
    "197.97.145.150",
    "197.97.145.151",
    "197.97.145.152",
    "197.97.145.153",
    "197.97.145.154",
    "197.97.145.155",
    "41.74.179.194",
    "41.74.179.195",
    "41.74.179.196",
    "41.74.179.197",
    "41.74.179.198",
    "41.74.179.199",
    "41.74.179.200",
    "41.74.179.201",
    "41.74.179.202",
    "41.74.179.203",
    "41.74.179.204",
    "41.74.179.205",
    "41.74.179.206",
    "41.74.179.207",
    "41.74.179.208",
    "41.74.179.209",
    "41.74.179.210",
    "41.74.179.211",
    "41.74.179.212",
    "41.74.179.213",
    "41.74.179.214",
];

/**
 * Check whether a request IP belongs to PayFast's servers.
 * In development (localhost), this check is skipped.
 */
export function isValidPayFastIP(ip: string | null): boolean {
    // Skip in development
    if (process.env.NODE_ENV === "development") return true;
    if (!ip) return false;
    return PAYFAST_VALID_IPS.includes(ip);
}
