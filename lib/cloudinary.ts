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
  next_cursor?: string;
  total_count?: number;
};

export type CloudinaryFolderPage = {
  images: CloudinaryImage[];
  totalCount: number;
  nextCursor?: string;
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
  if (!normalizedFolder) return false;
  
  // Normalize the publicId to handle both cases
  const normalizedPublicId = publicId.trim();
  
  // Case 1: publicId has the full path (e.g., "galleries/prestige/image.jpg")
  if (normalizedPublicId.startsWith(`${normalizedFolder}/`)) {
    return true;
  }
  
  // Case 2: publicId is just the filename without folder prefix
  // In this case, accept it as valid as long as it doesn't have a different folder prefix
  if (!normalizedPublicId.includes("/")) {
    return true;
  }
  
  // Case 3: publicId has some folder prefix, but it doesn't match
  return false;
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
    const timeoutMs = options?.timeoutMs ?? 7000;
    const mapped: CloudinaryImage[] = [];
    let nextCursor: string | undefined;

    do {
      const executePromise = cloudinary.search
        .expression(`folder:"${cleanPath}" AND resource_type:image`)
        .sort_by("public_id", "asc")
        .max_results(500)
        .next_cursor(nextCursor || "")
        .execute() as Promise<CloudinarySearchResponse>;

      const result = await Promise.race<CloudinarySearchResponse>([
        executePromise,
        new Promise<CloudinarySearchResponse>((_, reject) =>
          setTimeout(() => reject(new Error("Cloudinary search timeout")), timeoutMs)
        ),
      ]);

      if (Array.isArray(result.resources)) {
        mapped.push(...result.resources.map(toCloudinaryImage));
      }

      nextCursor = result.next_cursor;
    } while (nextCursor);

    if (mapped.length === 0) {
      return [];
    }

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

export async function fetchImagesPageFromFolder(
  folderPath: string,
  options?: {
    page?: number;
    perPage?: number;
    sortBy?: "filename" | "created_at";
    timeoutMs?: number;
  }
): Promise<CloudinaryFolderPage> {
  const cleanPath = normalizeFolderPath(folderPath);
  if (!cleanPath || !hasCloudinaryAdminConfig()) {
    return { images: [], totalCount: 0 };
  }

  const page = Math.max(1, options?.page ?? 1);
  const perPage = Math.min(500, Math.max(1, options?.perPage ?? 50));
  const timeoutMs = options?.timeoutMs ?? 7000;

  try {
    let nextCursor: string | undefined;
    let currentPage = 1;
    let totalCount = 0;

    while (true) {
      const executePromise = cloudinary.search
        .expression(`folder:"${cleanPath}" AND resource_type:image`)
        .sort_by("public_id", "asc")
        .max_results(perPage)
        .next_cursor(nextCursor || "")
        .execute() as Promise<CloudinarySearchResponse>;

      const result = await Promise.race<CloudinarySearchResponse>([
        executePromise,
        new Promise<CloudinarySearchResponse>((_, reject) =>
          setTimeout(() => reject(new Error("Cloudinary search timeout")), timeoutMs)
        ),
      ]);

      if (!totalCount) {
        totalCount = result.total_count ?? 0;
      }

      if (currentPage === page || !result.next_cursor) {
        const mapped = Array.isArray(result.resources) ? result.resources.map(toCloudinaryImage) : [];
        const images =
          options?.sortBy === "created_at"
            ? mapped
            : mapped.sort((a, b) =>
                filenameFromPublicId(a.public_id).localeCompare(filenameFromPublicId(b.public_id), undefined, {
                  numeric: true,
                  sensitivity: "base",
                })
              );

        return {
          images,
          totalCount,
          nextCursor: result.next_cursor,
        };
      }

      nextCursor = result.next_cursor;
      currentPage += 1;
    }
  } catch (error) {
    console.error("Error fetching paginated images from Cloudinary folder:", error);
    return { images: [], totalCount: 0 };
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
