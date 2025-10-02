import { test, expect } from '@playwright/test'

test.describe('レポート機能テスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3003/reports')
    // タブボタンが表示されるまで待つ
    await page.locator('button:has-text("レポート生成")').waitFor({ timeout: 20000 })
  })

  test('レポートページが正常に表示される', async ({ page }) => {
    await expect(page).toHaveURL(/reports/)

    // main要素が存在することを確認
    const mainElement = page.locator('main.page-content')
    await expect(mainElement).toBeVisible()

    // ページタイトルが正しく表示されている
    const heading = page.locator('h1:has-text("レポート管理")')
    await expect(heading).toBeVisible()
  })

  test('タブナビゲーションが機能する', async ({ page }) => {
    // レポート生成タブ
    const generateTab = page.locator('button:has-text("レポート生成")')
    await expect(generateTab).toBeVisible()
    await generateTab.evaluate((el: HTMLElement) => el.click())
    await page.waitForTimeout(500)
    await expect(generateTab).toHaveClass(/border-blue-500/, { timeout: 10000 })

    // レポート履歴タブ
    const historyTab = page.locator('button:has-text("レポート履歴")')
    await expect(historyTab).toBeVisible()
    await historyTab.evaluate((el: HTMLElement) => el.click())
    await page.waitForTimeout(500)
    await expect(historyTab).toHaveClass(/border-blue-500/, { timeout: 10000 })

    // テンプレートタブ
    const templatesTab = page.locator('nav button:has-text("テンプレート")')
    await expect(templatesTab).toBeVisible()
    await templatesTab.evaluate((el: HTMLElement) => el.click())
    await page.waitForTimeout(500)
    await expect(templatesTab).toHaveClass(/border-blue-500/, { timeout: 10000 })

    // 分析タブ
    const analyticsTab = page.locator('button:has-text("分析")')
    await expect(analyticsTab).toBeVisible()
    await analyticsTab.evaluate((el: HTMLElement) => el.click())
    await page.waitForTimeout(500)
    await expect(analyticsTab).toHaveClass(/border-blue-500/, { timeout: 10000 })
  })

  test('レポート生成タブに必要な要素が表示される', async ({ page }) => {
    // デフォルトで「レポート生成」タブが選択されている
    const generateTab = page.locator('button:has-text("レポート生成")')
    await expect(generateTab).toHaveClass(/border-blue-500/)

    // 評価選択ドロップダウンが存在する（評価データがある場合）
    // または ReportGenerator コンポーネントが表示される
    const reportContent = page.locator('main .max-w-7xl')
    await expect(reportContent).toBeVisible()
  })

  test('レポート履歴タブに切り替えられる', async ({ page }) => {
    // レポート履歴タブをクリック
    const historyTab = page.locator('button:has-text("レポート履歴")')
    await historyTab.evaluate((el: HTMLElement) => el.click())
    await page.waitForTimeout(500)

    // ReportHistory コンポーネントが表示される
    await expect(historyTab).toHaveClass(/border-blue-500/, { timeout: 10000 })
  })

  test('テンプレートタブが正しく表示される', async ({ page }) => {
    // テンプレートタブをクリック
    const templatesTab = page.locator('button:has-text("テンプレート")')
    await templatesTab.evaluate((el: HTMLElement) => el.click())
    await page.waitForTimeout(500)

    // コンテンツが表示される
    const mainContent = page.locator('main')
    await expect(mainContent).toBeVisible()
  })

  test('分析タブが正しく表示される', async ({ page }) => {
    // 分析タブをクリック
    const analyticsTab = page.locator('button:has-text("分析")')
    await analyticsTab.evaluate((el: HTMLElement) => el.click())
    await page.waitForTimeout(1000)

    // コンテンツが表示される
    const mainContent = page.locator('main')
    await expect(mainContent).toBeVisible()
  })

  test('レポートページのアクセシビリティ', async ({ page }) => {
    // main要素にrole属性がある（暗黙的でも可）
    const mainElement = page.locator('main')
    await expect(mainElement).toBeVisible()

    // h1見出しが存在する
    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1)

    // タブにはボタン要素が使われている
    const tabButtons = page.locator('nav button')
    await expect(tabButtons).toHaveCount(4)
  })

  test('評価選択ドロップダウンが動的に表示される', async ({ page }) => {
    // レポート生成タブが選択されている状態で
    const generateTab = page.locator('button:has-text("レポート生成")')
    await expect(generateTab).toHaveClass(/border-blue-500/)

    // 評価選択ドロップダウンは「レポート生成」タブでのみ表示される
    // （評価データがある場合のみ表示されるため、存在チェックは条件付き）
    const evaluationSelect = page.locator('#target-evaluation')
    const isVisible = await evaluationSelect.isVisible().catch(() => false)

    if (isVisible) {
      // 評価データがある場合、ドロップダウンが表示される
      await expect(evaluationSelect).toBeVisible()
      await expect(evaluationSelect).toHaveAttribute('aria-label', 'レポート対象の評価を選択')
    }

    // 他のタブに切り替えると評価選択は表示されない
    const historyTab = page.locator('button:has-text("レポート履歴")')
    await historyTab.evaluate((el: HTMLElement) => el.click())
    await page.waitForTimeout(300)
    await expect(evaluationSelect).not.toBeVisible()
  })
})
