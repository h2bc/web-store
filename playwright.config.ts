import { defineConfig, devices } from "@playwright/test";

const FRONT_URL = "http://localhost:3000";
const API_URL = "http://localhost:9000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: FRONT_URL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "pnpm dev:api",
      url: `${API_URL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "pnpm dev:front",
      url: FRONT_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
