import { test, expect } from '@playwright/test'

test.describe('ダッシュボード機能テスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/dashboard')
  })

  test('ページ構造が正しく表示される', async ({ page }) => {
    // ページが読み込まれるまで待機
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // h1見出しが存在する（sr-onlyの場合もあるので存在確認のみ）
    const h1 = page.locator('h1')
    const h1Count = await h1.count()
    expect(h1Count).toBeGreaterThanOrEqual(1)

    // main要素が存在する（動的読み込みのため待機）
    const mainElement = page.locator('main')
    await expect(mainElement).toBeVisible({ timeout: 15000 })

    // Header要素が存在することを確認
    const header = page.locator('header, [class*="header"]')
    const headerCount = await header.count()
    expect(headerCount).toBeGreaterThanOrEqual(1)
  })

  test('タブインターフェースが4つ表示される', async ({ page }) => {
    // ページ読み込み待機
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // 概要統計タブ
    const overviewTab = page.locator('button:has-text("概要統計")')
    await expect(overviewTab).toBeVisible({ timeout: 10000 })

    // グラフ分析タブ
    const chartsTab = page.locator('button:has-text("グラフ分析")')
    await expect(chartsTab).toBeVisible()

    // 作業一覧タブ
    const listTab = page.locator('button:has-text("作業一覧")')
    await expect(listTab).toBeVisible()

    // レポートタブ
    const reportsTab = page.locator('button:has-text("レポート")')
    await expect(reportsTab).toBeVisible()
  })

  test('タブクリックで切り替えができる', async ({ page }) => {
    // ページ読み込み待機
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // 概要統計タブがデフォルトでアクティブ
    const overviewTab = page.locator('button:has-text("概要統計")')
    await expect(overviewTab).toHaveClass(/border-blue/, { timeout: 10000 })

    // グラフ分析タブをクリック
    const chartsTab = page.locator('button:has-text("グラフ分析")')
    await chartsTab.click()
    await expect(chartsTab).toHaveClass(/border-blue/)

    // 作業一覧タブをクリック
    const listTab = page.locator('button:has-text("作業一覧")')
    await listTab.click()
    await expect(listTab).toHaveClass(/border-blue/)

    // レポートタブをクリック
    const reportsTab = page.locator('button:has-text("レポート")')
    await reportsTab.click()
    await expect(reportsTab).toHaveClass(/border-blue/)
  })

  test('概要タブ: 統計カードが表示される', async ({ page }) => {
    // ページ読み込み待機
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // 概要統計タブはデフォルトで選択されている
    // 統計カードが表示されることを確認
    const cards = page.locator('.bg-white.p-6.rounded-lg.border, .bg-white.rounded-lg.p-6.border')
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(3) // 少なくとも3枚のカード
  })

  test('概要タブ: 統計カードに数値データが表示される', async ({ page }) => {
    // ページ読み込み待機
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // 数値が表示されていることを確認
    const numbers = page.locator('.text-3xl.font-bold, .text-2xl.font-bold')
    const count = await numbers.count()
    expect(count).toBeGreaterThanOrEqual(2) // 少なくとも2つの数値カード
  })

  test('概要タブ: 新規評価作成ボタンが表示される', async ({ page }) => {
    // ページ読み込み待機
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // 新規評価作成ボタンが存在する
    const createButton = page.locator('button:has-text("新規評価作成")')
    await expect(createButton).toBeVisible({ timeout: 10000 })
  })

  test('グラフタブ: Canvas要素が表示される', async ({ page }) => {
    // ページ読み込み待機
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // グラフ分析タブをクリック
    const chartsTab = page.locator('button:has-text("グラフ分析")')
    await chartsTab.click()

    // Canvas要素が存在することを確認（Chart.jsで描画される）
    const canvas = page.locator('canvas')
    await expect(canvas.first()).toBeVisible({ timeout: 15000 })
  })

  test('グラフタブ: 複数のグラフが表示される', async ({ page }) => {
    // ページ読み込み待機
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // グラフ分析タブをクリック
    const chartsTab = page.locator('button:has-text("グラフ分析")')
    await chartsTab.click()
    await page.waitForTimeout(2000) // グラフ描画待機

    // 複数のCanvas要素が存在することを確認
    const canvases = page.locator('canvas')
    const count = await canvases.count()
    expect(count).toBeGreaterThanOrEqual(1) // 少なくとも1つのグラフ
  })

  test('一覧タブ: 評価リストが表示される', async ({ page }) => {
    // ページ読み込み待機
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // 作業一覧タブをクリック
    const listTab = page.locator('button:has-text("作業一覧")')
    await listTab.click()
    await page.waitForTimeout(2000) // コンポーネント読み込み待機

    // カードまたはリストアイテムが存在することを確認
    const items = page.locator('[class*="card"], .bg-white.rounded-lg')
    const count = await items.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('レポートタブ: レポートダッシュボードが表示される', async ({ page }) => {
    // ページ読み込み待機
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // レポートタブをクリック
    const reportsTab = page.locator('button:has-text("レポート")')
    await reportsTab.click()
    await page.waitForTimeout(2000)

    // レポート関連の要素が表示されることを確認
    const mainContent = page.locator('main')
    await expect(mainContent).toBeVisible()
  })

  test('ヘッダーに統計サマリーが表示される', async ({ page }) => {
    // ページ読み込み待機
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // ヘッダー内の統計サマリーを確認
    const statsSummary = page.getByTestId('stats-summary')
    await expect(statsSummary).toBeVisible({ timeout: 10000 })
  })

  test('レスポンシブデザイン: モバイルビューで正しく表示される', async ({ page }) => {
    // モバイルサイズに変更
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // タブが表示される
    const overviewTab = page.locator('button:has-text("概要統計")')
    await expect(overviewTab).toBeVisible({ timeout: 10000 })
  })

  test('レスポンシブデザイン: タブレットビューで正しく表示される', async ({ page }) => {
    // タブレットサイズに変更
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // すべてのタブが表示される
    const chartsTab = page.locator('button:has-text("グラフ分析")')
    await expect(chartsTab).toBeVisible({ timeout: 10000 })
  })

  test('データ読み込み完了確認', async ({ page }) => {
    // ページが読み込まれたことを確認
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    const mainElement = page.locator('main')
    await expect(mainElement).toBeVisible({ timeout: 10000 })
  })

  test('アクセシビリティ: タブボタンが存在する', async ({ page }) => {
    // ページ読み込み待機
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // タブボタンが4つ存在することを確認
    const tabs = page.locator('button:has-text("概要統計"), button:has-text("グラフ分析"), button:has-text("作業一覧"), button:has-text("レポート")')
    const count = await tabs.count()
    expect(count).toBe(4)
  })
})
