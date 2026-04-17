import { NextRequest, NextResponse } from "next/server";
import { verifyDownloadToken } from "@/lib/download-token";
import archiver from "archiver";
import { buildCloudinaryDownloadUrl } from "@/lib/cloudinary";

/**
 * GET /api/download?token=xxx
 *
 * Validates the download token, fetches the purchased Cloudinary images,
 * bundles them into a ZIP, and streams the result.
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

    try {
        const imageUrls = payload.assets.map((asset, i) => {
            const ext = asset.format || "jpg";
            const safeTitle = asset.title.replace(/[^a-zA-Z0-9 _-]/g, "");
            const paddedIndex = String(i + 1).padStart(2, "0");
            return {
                url: buildCloudinaryDownloadUrl(asset.ref, ext),
                filename: `${paddedIndex} - ${safeTitle}.${ext}`,
            };
        });

        const archive = archiver("zip", { zlib: { level: 5 } });
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
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Cloudinary download configuration is invalid" },
            { status: 500 }
        );
    }
}
