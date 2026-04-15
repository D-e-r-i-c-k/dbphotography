import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schema";

import { cloudinarySchemaPlugin } from "sanity-plugin-cloudinary";

// Sanity Studio only injects SANITY_STUDIO_* vars into the browser bundle – use those in sanity/.env
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "cex636bq";

if (!projectId) {
  throw new Error(
    "Missing Sanity project ID. Set SANITY_STUDIO_PROJECT_ID in sanity/.env (see sanity/.env.example)."
  );
}

const dataset = process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  name: "photography-studio",
  title: "Photography Studio",
  projectId,
  dataset,
  plugins: [structureTool(), cloudinarySchemaPlugin()],
  schema: {
    types: schemaTypes,
  },
});
