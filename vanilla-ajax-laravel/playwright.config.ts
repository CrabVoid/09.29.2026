import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'html' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:5500',
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome']
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5500 --strictPort',
    url: 'http://127.0.0.1:5500',
    reuseExistingServer: !process.env.CI
  }
});
