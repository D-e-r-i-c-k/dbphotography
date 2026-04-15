import { NextRequest, NextResponse } from "next/server";
import { verifyDownloadToken } from "@/lib/download-token";
import archiver from "archiver";

/**
 * GET /api/download?token=xxx
 *
 * Validates the download token, fetches full-resolution images
 * from Sanity CDN, bundles them into a ZIP, and streams the result.
 */
export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
        return NextResponse.json(
            { error: "Missing download token" },
            { status: 400 }
        );
    }

    let payload;
    try {
        payload = verifyDownloadToken(token);
    } catch (err) {
        const message =
            err instanceof Error ? err.message : "Invalid token";
        return NextResponse.json({ error: message }, { status: 403 });
    }

    // Build Cloudinary URLs from public_ids stored in the token ref
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;

    const imageUrls = payload.assets.map((asset, i) => {
        const ext = asset.format || "jpg";
        // Prefix with index to prevent duplicate filenames
        const safeTitle = asset.title.replace(/[^a-zA-Z0-9 _-]/g, "");
        const paddedIndex = String(i + 1).padStart(2, "0");
        return {
            url: `https://res.cloudinary.com/${cloudName}/image/upload/${asset.ref}.${ext}`,
            filename: `${paddedIndex} - ${safeTitle}.${ext}`,
        };
    });

    // Create a streaming ZIP archive
    const archive = archiver("zip", { zlib: { level: 5 } });

    // Fetch all images in parallel and append to archive
    const fetchPromises = imageUrls.map(async ({ url, filename }, i) => {
        try {
            const res = await fetch(url);
            if (!res.ok) {
                console.error(`[Download] Failed to fetch image ${i}: ${res.status}`);
                return;
            }
            const buffer = Buffer.from(await res.arrayBuffer());
            archive.append(buffer, { name: filename });
        } catch (err) {
            console.error(`[Download] Error fetching image ${i}:`, err);
        }
    });

    await Promise.all(fetchPromises);
    archive.finalize();

    // Convert archiver's Node stream to a Web ReadableStream
    const readable = new ReadableStream({
        start(controller) {
            archive.on("data", (chunk: Buffer) => {
                controller.enqueue(new Uint8Array(chunk));
            });
            archive.on("end", () => {
                controller.close();
            });
            archive.on("error", (err) => {
                console.error("[Download] Archive error:", err);
                controller.error(err);
            });
        },
    });

    return new Response(readable, {
        headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="photos.zip"`,
            "Cache-Control": "no-store",
        },
    });
}
