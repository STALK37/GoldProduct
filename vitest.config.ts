import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // The Supabase client throws on startup if these are missing. Tests that
    // touch the network mock the client outright; these keep the import safe.
    env: {
      VITE_SUPABASE_URL: "https://test-project.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_KEY: "test-anon-key",
      VITE_SITE_URL: "https://test.example.com",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/contexts/**", "src/components/CheckoutDialog.tsx", "src/components/SEO.tsx"],
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
