import { defineConfig } from "tsup";

export default defineConfig({
    entry: { server: "src/index.ts" },
    format: ["cjs"],
    dts: false,
    outDir: "dist",
    splitting: false,
    sourcemap: false,
    clean: true,
    external: ["express", "cors", "axios", "cheerio", "uuid", "path", "fs"],
    target: "node20",
    platform: "node",
});
