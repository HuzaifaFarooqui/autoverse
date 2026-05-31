import { defineConfig } from "tsup";

export default defineConfig([
    // === CLIENT BUNDLE (React/NPM usage) ===
    {
        entry: { index: "src/index.ts" },
        format: ["cjs", "esm"],
        dts: true,
        outDir: "dist",
        splitting: false,
        sourcemap: false,
        clean: true,
        target: "es2020",
        platform: "browser",
    },
    // === BROWSER EMBED (script tags / meta tags) ===
    {
        entry: { browser: "src/browser.ts" },
        format: ["esm"],
        dts: true,
        outDir: "dist",
        splitting: false,
        sourcemap: false,
        clean: false,
        noExternal: [/.*/],
        platform: "browser",
        target: "es2020",
        define: {
            "process.env.NODE_ENV": '"production"',
        },
    },
]);
