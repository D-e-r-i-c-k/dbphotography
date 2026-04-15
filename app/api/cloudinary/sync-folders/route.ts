import { NextRequest, NextResponse } from "next/server";
import { listAllFolders, fetchImagesFromFolder, fetchResource } from "@/lib/cloudinary";
import serverClient from "@/lib/sanity/serverClient";

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
  // Require a server write token
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    return NextResponse.json({ error: "SANITY_API_WRITE_TOKEN not configured" }, { status: 500 });
  }
  // If SYNC_SECRET is set, require it
  const syncSecret = process.env.SYNC_SECRET;
  if (syncSecret) {
    const header = request.headers.get("x-sync-secret");
    if (!header || header !== syncSecret) {
      return NextResponse.json({ error: "Missing or invalid sync secret" }, { status: 401 });
    }
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    // ignore
  }

  try {
    const foldersToSync: string[] = body?.folders && Array.isArray(body.folders) && body.folders.length > 0
      ? body.folders
      : await listAllFolders();

    const overwriteCover = Boolean(body?.overwriteCover);

    const results: any[] = [];

    for (const folder of foldersToSync) {
      try {
        // fetch existing gallery by cloudinaryFolder
        const existing = await serverClient.fetch(`*[_type == "gallery" && cloudinaryFolder == $folder][0]`, { folder });

        // Human-friendly title from folder (use last segment)
        const lastSegment = folder.split("/").pop() || folder;
        const title = titleCase(lastSegment.replace(/^\d+-?/, ""));
        const slug = slugify(title) || slugify(lastSegment);
        const docId = `gallery-${slug}`;

        // Fetch images and pick cover (respect existing coverIndex if present)
        const images = await fetchImagesFromFolder(folder, { sortBy: "filename" });

        const requestedIndex = typeof body?.coverIndex === "number" ? body.coverIndex : undefined;
        const indexFromDoc = existing?.coverIndex;
        const coverIndex = typeof requestedIndex === "number" ? requestedIndex : (typeof indexFromDoc === "number" ? indexFromDoc : 0);

        let coverImageObj: any = null;
        if (images.length > 0) {
          const selected = images[Math.min(Math.max(0, coverIndex), images.length - 1)];
          const resource = await fetchResource(selected.public_id);
          if (resource) {
            coverImageObj = {
              _type: "cloudinary.asset",
              public_id: resource.public_id,
              secure_url: resource.secure_url,
              url: resource.url,
              width: resource.width,
              height: resource.height,
              format: resource.format,
            };
          }
        }

        if (!existing) {
          // Create new gallery
          const newDoc: any = {
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
          // Patch existing
          let patch = serverClient.patch(existing._id).set({ title, cloudinaryFolder: folder });
          if (existing.defaultPrice == null) patch = patch.setIfMissing({ defaultPrice: 20 });
          // Decide whether to update coverImage
          const shouldUpdateCover = overwriteCover || !existing.coverImage || existing.coverIndex !== coverIndex;
          if (shouldUpdateCover && coverImageObj) {
            patch = patch.set({ coverImage: coverImageObj });
          }
          patch = patch.set({ coverIndex });
          await patch.commit();
          results.push({ folder, action: "patched", id: existing._id });
        }
      } catch (err) {
        console.error("Error syncing folder", folder, err);
        results.push({ folder, error: String(err) });
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error("/api/cloudinary/sync-folders error:", err);
    return NextResponse.json({ error: "Failed to sync folders" }, { status: 500 });
  }
}
