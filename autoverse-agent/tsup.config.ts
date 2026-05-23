import { defineConfig } from "tsup";

export default defineConfig([
    // === NODE BUILD (server, Express middleware, Autoverse class) ===
    {
        entry: { index: "src/index.ts" },
        format: ["cjs", "esm"],
        dts: true,
        outDir: "dist",
        splitting: false,
        sourcemap: false,
        clean: true,
        external: ["express", "cors", "axios", "cheerio", "uuid", "path", "fs"],
        target: "node18",
        platform: "node",
    },
    // === BROWSER BUILD (widget only — pure ESM, no Node deps) ===
    {
        entry: { browser: "src/browser.ts" },
        format: ["esm"],
        dts: true,
        outDir: "dist",
        splitting: false,
        sourcemap: false,
        clean: false, // don't wipe node build
        noExternal: [/.*/], // bundle everything into one file
        platform: "browser",
        target: "es2020",
        define: {
            "process.env.NODE_ENV": '"production"',
        },
    },
]);
