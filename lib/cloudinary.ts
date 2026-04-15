import { v2 as cloudinary } from "cloudinary";
import type { CloudinaryImage } from "./sanity/types";

// Configure cloudinary with the keys from environment variables
// This leverages the global Next.js process.env
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function filenameFromPublicId(publicId: string) {
  return publicId.split("/").pop() || publicId;
}

/**
 * Fetch all image assets from a specific Cloudinary folder.
 * Uses the Cloudinary Search API and returns a mapped CloudinaryImage array.
 * By default images are ordered by filename so galleries render in filename order.
 *
 * @param folderPath The exact folder path, e.g. "galleries/wedding-2026"
 * @param options.sortBy 'filename' | 'created_at' (default 'filename')
 */
export async function fetchImagesFromFolder(
  folderPath: string,
  options?: { sortBy?: "filename" | "created_at" }
): Promise<CloudinaryImage[]> {
  if (!folderPath) return [];

  // Ensure path doesn't start or end with slashes
  const cleanPath = folderPath.replace(/^\/+|\/+$/g, "");

  try {
    const search = cloudinary.search.expression(`folder:"${cleanPath}" AND resource_type:image`).max_results(500);

    // We'll always fetch the resources and sort client-side for filename ordering
    const result = await search.execute();

    if (!result.resources || !Array.isArray(result.resources)) {
      return [];
    }

    const mapped = result.resources.map((res: any) => ({
      _type: "cloudinary.asset",
      public_id: res.public_id,
      secure_url: res.secure_url,
      url: res.url,
      width: res.width,
      height: res.height,
      format: res.format,
    }));

    if (!options || options.sortBy === "filename") {
      return mapped.sort((a: CloudinaryImage, b: CloudinaryImage) =>
        filenameFromPublicId(a.public_id).localeCompare(filenameFromPublicId(b.public_id), undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );
    }

    // created_at is handled by Cloudinary search, if requested
    if (options.sortBy === "created_at") {
      return mapped; // original search already returned created order when requested; default we did not request that
    }

    return mapped;
  } catch (error) {
    console.error("Error fetching images from Cloudinary folder:", error);
    return [];
  }
}

/**
 * Recursively list all folders in the Cloudinary account.
 * Returns an array of folder paths (e.g. "galleries/wedding-2026").
 */
export async function listAllFolders(): Promise<string[]> {
  try {
    const seen = new Set<string>();
    const results: string[] = [];

    // Fetch root folders
    const root = await cloudinary.api.root_folders();
    const roots = root?.folders || [];

    async function walk(folder: any) {
      const path = folder.path || folder.name;
      if (!path || seen.has(path)) return;
      seen.add(path);
      results.push(path);

      // Fetch subfolders for this path
      try {
        const sub = await cloudinary.api.sub_folders(path);
        const subs = sub?.folders || [];
        for (const s of subs) {
          await walk(s);
        }
      } catch (e) {
        // ignore subfolder errors for this branch
      }
    }

    for (const f of roots) {
      await walk(f);
    }

    return results.sort();
  } catch (error) {
    console.error("Error listing Cloudinary folders:", error);
    return [];
  }
}

/**
 * Fetch a single resource info from Cloudinary by public_id.
 */
export async function fetchResource(publicId: string): Promise<Partial<CloudinaryImage> | null> {
  if (!publicId) return null;
  try {
    const res = await cloudinary.api.resource(publicId);
    return {
      public_id: res.public_id,
      secure_url: res.secure_url,
      url: res.url,
      width: res.width,
      height: res.height,
      format: res.format,
    };
  } catch (error) {
    console.error("Error fetching Cloudinary resource:", error);
    return null;
  }
}
