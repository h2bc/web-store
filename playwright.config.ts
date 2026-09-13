import { defineConfig, devices } from "@playwright/test";
import { API_URL, SITE_URL } from "./tests/support/data";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: SITE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "storefront",
      testIgnore: /admin\.test\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "admin",
      testMatch: /admin\.test\.ts/,
      dependencies: ["storefront"],
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "pnpm dev:api",
      url: `${API_URL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "pnpm dev:front",
      url: SITE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
