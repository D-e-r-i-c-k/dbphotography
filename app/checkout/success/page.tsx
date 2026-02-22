"use client";

import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Download, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

function SuccessContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [emailSent, setEmailSent] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [sending, setSending] = useState(false);
    const emailAttempted = useRef(false);

    const siteUrl =
        typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost:3000";

    const downloadUrl = token
        ? `${siteUrl}/api/download?token=${encodeURIComponent(token)}`
        : null;

    // Decode token to get photo count (base64url decode the payload)
    let photoCount = 0;
    if (token) {
        try {
            const parts = token.split(".");
            if (parts.length === 3) {
                const payload = JSON.parse(
                    atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
                );
                photoCount = payload.assets?.length ?? 0;
            }
        } catch {
            // ignore decode errors
        }
    }

    const sendEmail = useCallback(async () => {
        if (!token || emailAttempted.current) return;
        emailAttempted.current = true;
        setSending(true);

        try {
            const res = await fetch("/api/send-download-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });

            if (res.ok) {
                setEmailSent(true);
            } else {
                const data = await res.json();
                setEmailError(data.error || "Failed to send email");
            }
        } catch {
            setEmailError("Failed to send email");
        } finally {
            setSending(false);
        }
    }, [token]);

    // Auto-send email on mount
    useEffect(() => {
        sendEmail();
    }, [sendEmail]);

    if (!token) {
        return (
            <div className="animate-fade-in-up mx-auto flex max-w-lg flex-col items-center px-6 py-20 pt-[92px] text-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
                <h1 className="font-display mt-6 text-3xl font-semibold tracking-tight text-foreground">
                    Payment successful!
                </h1>
                <p className="mt-4 text-muted-foreground">
                    Thank you for your purchase. Check your email for download
                    instructions.
                </p>
                <div className="mt-8">
                    <Button asChild>
                        <Link href="/galleries">Browse more galleries</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up mx-auto flex max-w-lg flex-col items-center px-6 py-20 pt-[92px] text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h1 className="font-display mt-6 text-3xl font-semibold tracking-tight text-foreground">
                Payment successful!
            </h1>
            <p className="mt-4 text-muted-foreground">
                Thank you for your purchase.
                {photoCount > 0 && (
                    <>
                        {" "}
                        Your{" "}
                        {photoCount === 1
                            ? "photo is"
                            : `${photoCount} photos are`}{" "}
                        ready to download.
                    </>
                )}
            </p>

            {/* Download button */}
            {downloadUrl && (
                <Button asChild className="mt-8 gap-2" size="lg">
                    <a href={downloadUrl}>
                        <Download className="h-5 w-5" />
                        Download Photos (ZIP)
                    </a>
                </Button>
            )}

            {/* Email status */}
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                {sending ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending download link to your email…
                    </>
                ) : emailSent ? (
                    <>
                        <Mail className="h-4 w-4 text-green-500" />
                        Download link emailed! Check your inbox.
                    </>
                ) : emailError ? (
                    <span className="text-yellow-600">
                        Could not send email — please use the download button
                        above.
                    </span>
                ) : null}
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
                This download link expires in 72 hours.
            </p>

            <div className="mt-8 flex gap-4">
                <Button variant="outline" asChild>
                    <Link href="/galleries">Browse more galleries</Link>
                </Button>
                <Button variant="ghost" asChild>
                    <Link href="/">Go home</Link>
                </Button>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            }
        >
            <SuccessContent />
        </Suspense>
    );
}
