import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    // Frontend läuft auf 5173 (Vite dev server)
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Startet frontend und backend falls sie noch nicht laufen.
  webServer: [
    {
      command: "npm run dev",
      cwd: "../frontend",
      url: "http://localhost:5173",
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: `DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1 ${process.env.HOME}/.dotnet/dotnet run --project ../backend --launch-profile http`,
      url: "http://localhost:5000/api/hello",
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
})
