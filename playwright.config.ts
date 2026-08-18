import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 4173);
const BASE_URL = process.env.BASE_URL ?? `http://127.0.0.1:${PORT}`;

/**
 * End-to-end tests run against a real production build, not the dev server.
 * Several things that only break in production — the manual chunk split, the
 * `%VITE_SITE_URL%` substitution in index.html, asset hashing — would go
 * unnoticed otherwise.
 *
 *   npx playwright install chromium   # first run only
 *   npm run test:e2e
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],

  // Skipped when BASE_URL points somewhere else, so the same suite can be run
  // against a deployed environment.
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `npm run build && npx vite preview --port ${PORT} --host 127.0.0.1`,
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
