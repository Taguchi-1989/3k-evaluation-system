import { test, expect } from '@playwright/test'

test.describe('レポートページ基本テスト', () => {
  test('レポートページが正常に表示される', async ({ page }) => {
    await page.goto('http://localhost:3001/reports')

    // ページURLが正しい
    await expect(page).toHaveURL(/reports/)

    // main要素が表示される
    const mainElement = page.locator('main')
    await expect(mainElement).toBeVisible({ timeout: 10000 })

    // ページタイトルが表示される
    const heading = page.locator('h1:has-text("レポート管理")')
    await expect(heading).toBeVisible()

    // タブが4つ表示される
    const tabs = page.locator('button:has-text("レポート生成"), button:has-text("レポート履歴"), button:has-text("テンプレート"), button:has-text("分析")')
    await expect(tabs).toHaveCount(4)
  })
})
