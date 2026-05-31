/**
 * Autoverse Agent — Browser Entry Point
 *
 * This module is the browser-specific entry. It:
 *   1. Exports `initWidget` for manual usage
 *   2. Auto-initializes the widget as a safe side effect
 *
 * SAFETY GUARANTEES:
 *   - No `window` or `document` access at module evaluation time
 *   - SSR-safe (silently skips in Node/SSR environments)
 *   - Waits for DOM ready before touching the DOM
 *   - Prevents duplicate widget mounts
 *   - Wrapped in try/catch so it NEVER crashes the host app
 *   - Uses setTimeout(0) so it never blocks React rendering
 */

import { initWidget } from "./widget";

// Re-export for manual usage:
//   import { initWidget } from "autoverse-fyp";
//   initWidget({ botId: "abc123" });
export { initWidget };

// ============================================================
// SAFE AUTO-INIT (side effect)
//
// Runs ONLY in browser, AFTER current event loop tick,
// and AFTER DOM is ready. Never blocks, never crashes.
// ============================================================
try {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
        // setTimeout(0) ensures:
        //  - React finishes its synchronous render first
        //  - Manual initWidget() calls take precedence (they set av-root first)
        //  - This never blocks the main thread
        setTimeout(function autoInit() {
            try {
                // If user already called initWidget() manually, av-root exists — skip
                if (document.getElementById("av-root")) return;

                // Wait for DOM ready
                if (document.readyState === "loading") {
                    document.addEventListener("DOMContentLoaded", function onReady() {
                        try { initWidget(); } catch (_) { /* silent */ }
                    }, { once: true });
                } else {
                    initWidget();
                }
            } catch (_) {
                // Never crash the host app
            }
        }, 0);
    }
} catch (_) {
    // Outermost safety net — handles edge cases like
    // restrictive CSP environments or exotic SSR runtimes
}
