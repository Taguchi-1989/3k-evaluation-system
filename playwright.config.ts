import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Test Configuration
 *
 * 3つの環境をテスト:
 * 1. localhost (開発環境)
 * 2. Vercel (本番環境)
 * 3. Electron (デスクトップアプリ)
 */

export default defineConfig({
  testDir: './tests',

  // テストタイムアウト
  timeout: 30 * 1000,

  // 並列実行数
  fullyParallel: true,

  // CI環境での設定
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // レポーター
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],

  use: {
    // ベース設定
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Chrome DevTools Protocol
    launchOptions: {
      devtools: process.env.DEBUG === 'true'
    }
  },

  // プロジェクト（環境別）
  projects: [
    // ローカル開発環境
    {
      name: 'localhost-chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3000',
      },
      testMatch: /.*\.(spec|test)\.ts$/,
    },

    {
      name: 'localhost-firefox',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: 'http://localhost:3000',
      },
      testMatch: /.*\.(spec|test)\.ts$/,
    },

    // Vercel本番環境（環境変数で指定）
    {
      name: 'vercel-production',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.VERCEL_URL || 'https://your-app.vercel.app',
      },
      testMatch: /.*\.(spec|test)\.ts$/,
      // 本番環境テストは明示的に実行時のみ
      testIgnore: process.env.TEST_PRODUCTION !== 'true' ? /.*.ts$/ : undefined,
    },

    // Electron環境
    {
      name: 'electron',
      use: {
        ...devices['Desktop Chrome'],
        // Electronテストは別の設定が必要
      },
      testMatch: /electron.*\.(spec|test)\.ts$/,
    },

    // モバイル環境（Vercel用）
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        baseURL: process.env.VERCEL_URL || 'http://localhost:3000',
      },
      testMatch: /.*\.(spec|test)\.ts$/,
      testIgnore: process.env.TEST_MOBILE !== 'true' ? /.*.ts$/ : undefined,
    },
  ],

  // Webサーバー設定（ローカルテスト用）
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
