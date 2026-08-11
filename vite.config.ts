import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, type UserConfig } from "vite";

const PRODUCTION_CHUNK_NAMES = {
  framework: "framework",
  refine: "refine",
  tables: "tables",
} as const;

const DEPENDENCY_PATHS = {
  framework: ["/node_modules/react/", "/node_modules/react-dom/", "/node_modules/react-router/"],
  refine: [
    "/node_modules/@refinedev/core/",
    "/node_modules/@refinedev/kbar/",
    "/node_modules/@refinedev/react-router/",
    "/node_modules/@refinedev/rest/",
    "/node_modules/@tanstack/query-core/",
    "/node_modules/@tanstack/react-query/",
  ],
  tables: [
    "/node_modules/@refinedev/react-table/",
    "/node_modules/@tanstack/react-table/",
  ],
} as const;

function getVendorChunk(id: string) {
  if (!id.includes("node_modules")) {
    return undefined;
  }

  const chunk = Object.entries(DEPENDENCY_PATHS).find(([, paths]) =>
    paths.some((dependencyPath) => id.includes(dependencyPath)),
  );

  return chunk ? PRODUCTION_CHUNK_NAMES[chunk[0] as keyof typeof PRODUCTION_CHUNK_NAMES] : undefined;
}

const config: UserConfig = {
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: getVendorChunk,
      },
    },
  },
};

export default defineConfig(config);
