import { NextRequest, NextResponse } from "next/server";
import { decryptUrl } from "@/lib/obfuscate";
import sharp from "sharp";
import path from "path";
import fs from "fs";

/**
 * GET /api/image-proxy/[q]
 *
 * Proxies and WATERMARKS an encrypted Sanity CDN URL.
 * Bakes the watermark natively into the pixels via `sharp`
 * so it cannot be removed via DOM manipulation.
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
            next: { revalidate: 86400 }, 
        });

        if (!res.ok) {
            return new NextResponse("Failed to fetch image", { status: res.status });
        }

        const imageBuffer = await res.arrayBuffer();
        let processedBuffer: Buffer<ArrayBufferLike> = Buffer.from(new Uint8Array(imageBuffer));

        const watermarkPath = path.join(process.cwd(), "public", "watermark-logo.png");
        
        if (fs.existsSync(watermarkPath)) {
            const image = sharp(processedBuffer);
            const metadata = await image.metadata();
            
            if (metadata.width && metadata.height) {
                const isHorizontal = metadata.width > metadata.height;
                
                // Calculate dimensions based on aspect ratio rules
                const watermarkWidth = isHorizontal 
                    ? Math.round(metadata.width * 0.8) 
                    : metadata.width; 
                
                // Build the watermark buffer with 80% opacity
                const wmBuffer = await sharp(watermarkPath)
                    .resize({ width: watermarkWidth })
                    .composite([{
                        input: Buffer.from([255, 255, 255, Math.round(255 * 0.8)]),
                        raw: { width: 1, height: 1, channels: 4 },
                        tile: true,
                        blend: 'dest-in'
                    }])
                    .png()
                    .toBuffer();
                
                const wmMeta = await sharp(wmBuffer).metadata();
                const wmHeight = wmMeta.height || 0;
                
                let topOffset = 0;
                let leftOffset = 0;
                
                if (isHorizontal) {
                    topOffset = Math.round((metadata.height - wmHeight) / 2);
                    leftOffset = Math.round((metadata.width - watermarkWidth) / 2);
                } else {
                    topOffset = Math.round((metadata.height * 0.75) - (wmHeight / 2));
                    leftOffset = Math.round((metadata.width - watermarkWidth) / 2);
                }
                
                // Clamp offsets to prevent 'bad extract area' exceptions in sharp
                topOffset = Math.max(0, Math.min(topOffset, metadata.height - wmHeight));
                leftOffset = Math.max(0, Math.min(leftOffset, metadata.width - watermarkWidth));
                
                processedBuffer = await image
                    .composite([{
                        input: wmBuffer,
                        top: topOffset,
                        left: leftOffset,
                        blend: 'over'
                    }])
                    .jpeg({ quality: 80, progressive: true }) 
                    .toBuffer();
            }
        }

        const headers = new Headers();
        headers.set("Content-Type", "image/jpeg");
        headers.set("Content-Length", processedBuffer.length.toString());
        headers.set(
            "Cache-Control",
            "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable"
        );
        headers.set("CDN-Cache-Control", "public, max-age=31536000, immutable");

        return new NextResponse(new Uint8Array(processedBuffer), { headers });
    } catch (err) {
        console.error("[Image Proxy] Error processing image:", err);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
