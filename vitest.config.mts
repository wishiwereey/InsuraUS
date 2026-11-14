import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": r("./src"),
      // `server-only` throws outside the React Server Components runtime; it's a no-op for unit tests.
      "server-only": r("./tests/stubs/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // API route tests generate the sample PDFs once; give them headroom on slow CI runners.
    testTimeout: 20_000,
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts", "src/app/api/**/*.ts"],
      // Thin SDK wrappers / prompt text: exercised end-to-end, not meaningful to unit-cover.
      exclude: ["src/lib/gemini/prompts.ts", "src/lib/gemini/schema.ts", "src/lib/storage.ts"],
      reporter: ["text", "json-summary", "html"],
      reportsDirectory: "test-results/coverage",
    },
  },
});
