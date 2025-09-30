import { test, expect } from '@playwright/test'

test.describe('3K評価アプリケーション - 基本動作テスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001')
  })

  test('ホームページが正常に表示される', async ({ page }) => {
    await expect(page).toHaveTitle(/3K/)

    // ページが完全にロードされるまで待機
    await page.waitForLoadState('networkidle')

    // 基本要素の確認
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('ダッシュボードページにアクセスできる', async ({ page }) => {
    await page.goto('http://localhost:3001/dashboard')
    await page.waitForLoadState('networkidle')

    // ダッシュボードの要素確認
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('評価ページ（肉体因子）にアクセスできる', async ({ page }) => {
    await page.goto('http://localhost:3001/evaluation/physical')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('評価ページ（精神因子）にアクセスできる', async ({ page }) => {
    await page.goto('http://localhost:3001/evaluation/mental')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('評価ページ（環境因子）にアクセスできる', async ({ page }) => {
    await page.goto('http://localhost:3001/evaluation/environmental')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('評価ページ（危険因子）にアクセスできる', async ({ page }) => {
    await page.goto('http://localhost:3001/evaluation/hazard')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('評価ページ（作業時間）にアクセスできる', async ({ page }) => {
    await page.goto('http://localhost:3001/evaluation/worktime')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('レポートページにアクセスできる', async ({ page }) => {
    await page.goto('http://localhost:3001/report')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })
})