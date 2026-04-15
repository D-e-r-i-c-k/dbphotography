import { createClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";

const token = process.env.SANITY_API_WRITE_TOKEN;

if (!token) {
  // We don't throw here so the module can be imported in read-only contexts,
  // but server-side sync endpoints should validate the token exists.
}

export const serverClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

export default serverClient;
