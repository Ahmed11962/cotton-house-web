import { defineConfig } from '@playwright/test';
import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());
export default defineConfig({
  testDir: './tests',
  testMatch: '*.spec.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    headless: true,
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
      args: ['--no-sandbox'],
    },
    trace: 'retain-on-failure',
  },
  reporter: 'list',
});
