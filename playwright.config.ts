import { defineConfig, devices } from "@playwright/test";

const PORT = 3200;

export default defineConfig({
  testDir: "./e2e",
  workers: 1, // os testes compartilham o banco e o estado do admin
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL: `http://localhost:${PORT}`, trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node scripts/e2e-server.mjs",
    url: `http://localhost:${PORT}`,
    timeout: 180_000,
    reuseExistingServer: false,
    env: {
      DATABASE_URL: "file:./e2e.db",
      ADMIN_PASSWORD: "e2e-senha",
      ADMIN_SESSION_SECRET: "e2e-secret",
      STRIPE_SECRET_KEY: "", // modo simulado
      APP_URL: `http://localhost:${PORT}`,
    },
  },
});
