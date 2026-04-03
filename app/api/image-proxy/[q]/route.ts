import { NextRequest, NextResponse } from "next/server";
import { decryptUrl } from "@/lib/obfuscate";

/**
 * GET /api/image-proxy/[q]
 *
 * Proxies an encrypted Sanity CDN URL to hide the original asset ID from the client.
 * This prevents users from removing the ?w=800 parameters and downloading the full-res
 * unwatermarked images without paying.
 *
 * Performance optimizations:
 * - Streams the response instead of buffering the entire image
 * - Aggressive cache headers (1 year immutable)
 * - Forwards Sanity's content-type and content-length
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ q: string }> }) {
    const { q } = await params;

    if (!q) {
        return new NextResponse("Missing query", { status: 400 });
    }

    const decryptedUrl = decryptUrl(q);

    if (!decryptedUrl || !decryptedUrl.startsWith("https://cdn.sanity.io/images/")) {
        return new NextResponse("Forbidden or invalid URL", { status: 403 });
    }

    try {
        const res = await fetch(decryptedUrl, {
            // Allow Next.js to cache this fetch on the server side too
            next: { revalidate: 86400 }, // Revalidate once per day
        });

        if (!res.ok) {
            return new NextResponse("Failed to fetch image", { status: res.status });
        }

        const headers = new Headers();
        headers.set("Content-Type", res.headers.get("Content-Type") || "image/jpeg");
        
        // Forward content-length if available (helps browsers show progress)
        const contentLength = res.headers.get("Content-Length");
        if (contentLength) {
            headers.set("Content-Length", contentLength);
        }

        // Aggressive caching: immutable for 1 year with stale-while-revalidate fallback
        // The encrypted URL includes all transform params, so it's safe to cache forever
        headers.set(
            "Cache-Control",
            "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable"
        );
        
        // Vercel-specific: cache at the edge for max performance
        headers.set("CDN-Cache-Control", "public, max-age=31536000, immutable");

        // Stream the response body instead of buffering into memory
        return new NextResponse(res.body, { headers });
    } catch (err) {
        console.error("[Image Proxy] Error fetching image:", err);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
