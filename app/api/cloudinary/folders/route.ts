import { NextResponse } from "next/server";
import { listAllFolders } from "@/lib/cloudinary";

export async function GET(request: Request) {
  try {
    // If SYNC_SECRET is set, require it to be present in the request header
    const syncSecret = process.env.SYNC_SECRET;
    if (syncSecret) {
      const header = request.headers.get("x-sync-secret");
      if (!header || header !== syncSecret) {
        return NextResponse.json({ error: "Missing or invalid sync secret" }, { status: 401 });
      }
    }
    const folders = await listAllFolders();
    return NextResponse.json({ folders });
  } catch (err) {
    console.error("/api/cloudinary/folders error:", err);
    return NextResponse.json({ error: "Failed to list folders" }, { status: 500 });
  }
}
