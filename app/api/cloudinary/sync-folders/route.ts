import { NextRequest, NextResponse } from "next/server";
import {
  fetchImagesFromFolder,
  fetchResource,
  hasCloudinaryAdminConfig,
  listAllFolders,
} from "@/lib/cloudinary";
import type { CloudinaryImage } from "@/lib/sanity/types";
import serverClient from "@/lib/sanity/serverClient";

interface SyncRequestBody {
  folders?: string[];
  overwriteCover?: boolean;
  coverIndex?: number;
}

interface ExistingGalleryDocument {
  _id: string;
  coverImage?: CloudinaryImage;
  coverIndex?: number;
  defaultPrice?: number;
}

interface SyncResult {
  folder: string;
  action: "created" | "patched" | "skipped" | "error";
  id?: string;
  reason?: string;
  error?: string;
}

function slugify(input: string) {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 200)
  );
}

function titleCase(input: string) {
  return input
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function POST(request: NextRequest) {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    return NextResponse.json({ error: "SANITY_API_WRITE_TOKEN not configured" }, { status: 500 });
  }

  if (!hasCloudinaryAdminConfig()) {
    return NextResponse.json({ error: "Cloudinary admin credentials are not fully configured" }, { status: 500 });
  }

  const syncSecret = process.env.SYNC_SECRET;
  if (syncSecret) {
    const header = request.headers.get("x-sync-secret");
    if (!header || header !== syncSecret) {
      return NextResponse.json({ error: "Missing or invalid sync secret" }, { status: 401 });
    }
  }

  let body: SyncRequestBody = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    const foldersToSync: string[] = body.folders && Array.isArray(body.folders) && body.folders.length > 0
      ? body.folders
      : await listAllFolders();

    const overwriteCover = Boolean(body.overwriteCover);

    const results: SyncResult[] = [];

    for (const folder of foldersToSync) {
      try {
        const existing = await serverClient.fetch<ExistingGalleryDocument | null>(
          `*[_type == "gallery" && cloudinaryFolder == $folder][0]`,
          { folder }
        );

        const lastSegment = folder.split("/").pop() || folder;
        const title = titleCase(lastSegment.replace(/^\d+-?/, ""));
        const slug = slugify(title) || slugify(lastSegment);
        const docId = `gallery-${slug}`;
        const images = await fetchImagesFromFolder(folder, { sortBy: "filename" });

        const requestedIndex = typeof body.coverIndex === "number" ? body.coverIndex : undefined;
        const indexFromDoc = existing?.coverIndex;
        const coverIndex = typeof requestedIndex === "number" ? requestedIndex : (typeof indexFromDoc === "number" ? indexFromDoc : 0);

        let coverImageObj: CloudinaryImage | null = null;
        if (images.length > 0) {
          const selected = images[Math.min(Math.max(0, coverIndex), images.length - 1)];
          coverImageObj = await fetchResource(selected.public_id);
        }

        if (!existing) {
          const newDoc: {
            _id: string;
            _type: "gallery";
            title: string;
            slug: { _type: "slug"; current: string };
            cloudinaryFolder: string;
            defaultPrice: number;
            coverIndex: number;
            coverImage?: CloudinaryImage;
          } = {
            _id: docId,
            _type: "gallery",
            title,
            slug: { _type: "slug", current: slug },
            cloudinaryFolder: folder,
            defaultPrice: 20,
            coverIndex: coverIndex,
          };
          if (coverImageObj) newDoc.coverImage = coverImageObj;

          await serverClient.createIfNotExists(newDoc);
          results.push({ folder, action: "created", id: docId });
        } else {
          let patch = serverClient.patch(existing._id).set({ title, cloudinaryFolder: folder });
          if (existing.defaultPrice == null) patch = patch.setIfMissing({ defaultPrice: 20 });
          const shouldUpdateCover = overwriteCover || !existing.coverImage || existing.coverIndex !== coverIndex;

          if (shouldUpdateCover && coverImageObj) {
            patch = patch.set({ coverImage: coverImageObj });
          } else if (shouldUpdateCover && !coverImageObj) {
            results.push({ folder, action: "skipped", id: existing._id, reason: "No images found for cover selection" });
            continue;
          }

          patch = patch.set({ coverIndex });
          await patch.commit();
          results.push({ folder, action: "patched", id: existing._id });
        }
      } catch (err) {
        console.error("Error syncing folder", folder, err);
        results.push({ folder, action: "error", error: err instanceof Error ? err.message : String(err) });
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error("/api/cloudinary/sync-folders error:", err);
    return NextResponse.json({ error: "Failed to sync folders" }, { status: 500 });
  }
}
