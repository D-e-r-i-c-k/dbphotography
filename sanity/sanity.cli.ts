import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "cex636bq",
    dataset: "production",
  },
  server: {
    hostname: "localhost",
    port: 3333,
  },
});
