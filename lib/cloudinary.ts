import { v2 as cloudinary } from "cloudinary";
import type { CloudinaryImage } from "./sanity/types";

type CloudinaryFolderNode = {
  name?: string;
  path?: string;
};

type CloudinarySearchResource = {
  public_id: string;
  secure_url?: string;
  url?: string;
  width?: number;
  height?: number;
  format?: string;
};

type CloudinarySearchResponse = {
  resources?: CloudinarySearchResource[];
};

function getConfiguredCloudName(): string {
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || "";
}

const cloudName = getConfiguredCloudName();

cloudinary.config({
  cloud_name: cloudName,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function filenameFromPublicId(publicId: string) {
  return publicId.split("/").pop() || publicId;
}

function normalizeFolderPath(folderPath: string): string {
  return folderPath.replace(/^\/+|\/+$/g, "");
}

export function getCloudinaryCloudName(): string {
  return cloudName;
}

export function hasCloudinaryAdminConfig(): boolean {
  return Boolean(cloudName && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

export function isPublicIdInFolder(publicId: string, folderPath: string): boolean {
  const normalizedFolder = normalizeFolderPath(folderPath);
  return Boolean(normalizedFolder) && publicId.startsWith(`${normalizedFolder}/`);
}

export function buildCloudinaryDownloadUrl(publicId: string, format = "jpg"): string {
  if (!cloudName) {
    throw new Error("Cloudinary cloud name is not configured");
  }

  return cloudinary.url(publicId, {
    secure: true,
    resource_type: "image",
    type: "upload",
    format,
  });
}

function toCloudinaryImage(resource: CloudinarySearchResource): CloudinaryImage {
  return {
    _type: "cloudinary.asset",
    public_id: resource.public_id,
    secure_url: resource.secure_url,
    url: resource.url,
    width: resource.width,
    height: resource.height,
    format: resource.format,
  };
}

export async function fetchImagesFromFolder(
  folderPath: string,
  options?: { sortBy?: "filename" | "created_at"; timeoutMs?: number }
): Promise<CloudinaryImage[]> {
  const cleanPath = normalizeFolderPath(folderPath);
  if (!cleanPath || !hasCloudinaryAdminConfig()) {
    return [];
  }

  try {
    const search = cloudinary.search
      .expression(`folder:"${cleanPath}" AND resource_type:image`)
      .max_results(500);

    const timeoutMs = options?.timeoutMs ?? 7000;
    const executePromise = search.execute() as Promise<CloudinarySearchResponse>;
    const result = await Promise.race<CloudinarySearchResponse>([
      executePromise,
      new Promise<CloudinarySearchResponse>((_, reject) =>
        setTimeout(() => reject(new Error("Cloudinary search timeout")), timeoutMs)
      ),
    ]);

    if (!Array.isArray(result.resources)) {
      return [];
    }

    const mapped = result.resources.map(toCloudinaryImage);

    if (options?.sortBy === "created_at") {
      return mapped;
    }

    return mapped.sort((a, b) =>
      filenameFromPublicId(a.public_id).localeCompare(filenameFromPublicId(b.public_id), undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );
  } catch (error) {
    console.error("Error fetching images from Cloudinary folder:", error);
    return [];
  }
}

export async function listAllFolders(): Promise<string[]> {
  if (!hasCloudinaryAdminConfig()) {
    return [];
  }

  try {
    const seen = new Set<string>();
    const results: string[] = [];
    const root = (await cloudinary.api.root_folders()) as { folders?: CloudinaryFolderNode[] };
    const roots = root.folders || [];

    async function walk(folder: CloudinaryFolderNode) {
      const path = folder.path || folder.name;
      if (!path || seen.has(path)) return;

      seen.add(path);
      results.push(path);

      try {
        const sub = (await cloudinary.api.sub_folders(path)) as { folders?: CloudinaryFolderNode[] };
        const subs = sub.folders || [];

        for (const child of subs) {
          await walk(child);
        }
      } catch {
        return;
      }
    }

    for (const folder of roots) {
      await walk(folder);
    }

    return results.sort();
  } catch (error) {
    console.error("Error listing Cloudinary folders:", error);
    return [];
  }
}

export async function fetchResource(publicId: string): Promise<CloudinaryImage | null> {
  if (!publicId || !hasCloudinaryAdminConfig()) return null;

  try {
    const resource = (await cloudinary.api.resource(publicId)) as CloudinarySearchResource;
    return toCloudinaryImage(resource);
  } catch (error) {
    console.error("Error fetching Cloudinary resource:", error);
    return null;
  }
}
