import { NextRequest, NextResponse } from "next/server";
import { validateITNSignature, isValidPayFastIP } from "@/lib/payfast";

/**
 * POST /api/payfast-notify
 *
 * PayFast sends an Instant Transaction Notification (ITN) here
 * after a payment is completed (or fails).
 *
 * This endpoint:
 * 1. Validates the source IP is from PayFast
 * 2. Parses the URL-encoded form body
 * 3. Validates the signature
 * 4. Checks the payment status
 * 5. Logs the result (order storage / download delivery is a future step)
 */
export async function POST(request: NextRequest) {
    try {
        // Step 1: Validate source IP
        const forwardedFor = request.headers.get("x-forwarded-for");
        const requestIP = forwardedFor
            ? forwardedFor.split(",")[0].trim()
            : null;

        if (!isValidPayFastIP(requestIP)) {
            console.error(
                `[PayFast ITN] Request from untrusted IP: ${requestIP}`
            );
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        // Step 2: Parse body
        const text = await request.text();
        const params = new URLSearchParams(text);
        const body: Record<string, string> = {};
        params.forEach((value, key) => {
            body[key] = value;
        });

        console.log(
            `[PayFast ITN] Received notification from ${requestIP} for payment ${body.m_payment_id || "unknown"}`
        );

        // Step 3: Validate signature
        const isValid = validateITNSignature(body);
        if (!isValid) {
            console.error("[PayFast ITN] Invalid signature", {
                paymentId: body.m_payment_id,
                status: body.payment_status,
            });
            return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
        }

        const paymentStatus = body.payment_status;
        const paymentId = body.m_payment_id;
        const amount = body.amount_gross;

        console.log(
            `[PayFast ITN] Payment ${paymentId}: status=${paymentStatus}, amount=R${amount}`
        );

        if (paymentStatus === "COMPLETE") {
            // TODO: Store order in Sanity or database
            // TODO: Generate signed download URLs for full-res photos
            console.log(`[PayFast ITN] ✅ Payment ${paymentId} completed successfully`);
        } else {
            console.log(`[PayFast ITN] ⚠️ Payment ${paymentId} status: ${paymentStatus}`);
        }

        // PayFast expects a 200 OK response
        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("[PayFast ITN] Error processing notification:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

