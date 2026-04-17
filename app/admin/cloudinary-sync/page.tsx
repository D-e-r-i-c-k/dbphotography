"use client";

import { useEffect, useState } from "react";

type SyncResponse = {
  folders?: string[];
  results?: Array<Record<string, unknown>>;
  error?: string;
};

export default function CloudinarySyncPage() {
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchFolders();
  }, []);

  async function fetchFolders() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/cloudinary/folders");
      const data = (await res.json()) as SyncResponse;
      if (!res.ok) {
        throw new Error(data.error || "Failed to load folders");
      }
      setFolders(data.folders || []);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to load folders");
    } finally {
      setLoading(false);
    }
  }

  async function syncFolder(folder: string) {
    setLoading(true);
    setMessage(`Syncing ${folder}...`);
    try {
      const res = await fetch("/api/cloudinary/sync-folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folders: [folder] }),
      });
      const data = (await res.json()) as SyncResponse;
      if (!res.ok) {
        throw new Error(data.error || "Sync failed");
      }
      setMessage(JSON.stringify(data.results || data));
    } catch (err) {
      setMessage(`Sync failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  async function syncAll() {
    setLoading(true);
    setMessage("Syncing all folders...");
    try {
      const res = await fetch("/api/cloudinary/sync-folders", {
        method: "POST",
      });
      const data = (await res.json()) as SyncResponse;
      if (!res.ok) {
        throw new Error(data.error || "Sync failed");
      }
      setMessage(JSON.stringify(data.results || data));
    } catch (err) {
      setMessage(`Sync failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Cloudinary → Sanity sync</h1>
      <div className="mb-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={syncAll}
          disabled={loading}
        >
          Sync All Folders
        </button>
        <button
          className="ml-3 px-4 py-2 bg-gray-200 rounded"
          onClick={fetchFolders}
          disabled={loading}
        >
          Refresh Folder List
        </button>
      </div>

      {loading && <p>Loading folders…</p>}

      {!loading && folders.length === 0 && <p>No folders found.</p>}

      <ul className="space-y-2">
        {folders.map((f) => (
          <li key={f} className="flex items-center justify-between border p-3 rounded">
            <span className="font-mono text-sm">{f}</span>
            <div>
              <button
                className="px-3 py-1 bg-green-600 text-white rounded"
                onClick={() => syncFolder(f)}
              >
                Sync
              </button>
            </div>
          </li>
        ))}
      </ul>

      {message && (
        <pre className="mt-6 p-3 bg-black/5 rounded text-sm">{message}</pre>
      )}
    </div>
  );
}
