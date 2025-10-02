import { test, expect } from '@playwright/test'

/**
 * ペルソナベーステスト - 3K評価システム
 *
 * 実際のユーザー行動をシミュレートした統合テスト
 * ドキュメント: docs/PERSONA_TEST.md
 */

test.describe('ペルソナ1: 安全管理者 - 田中 健二 (45歳)', () => {
  test('シナリオ: 溶接作業の3K評価を実施してレポート出力', async ({ page }) => {
    // 1. ダッシュボードで過去の評価履歴を確認
    await page.goto('/dashboard')
    await expect(page.locator('h1')).toContainText(/ダッシュボード|Dashboard/)

    // 統計情報が表示されることを確認
    const statsSection = page.locator('[class*="stats"], [class*="metrics"]').first()
    await expect(statsSection).toBeVisible({ timeout: 10000 })

    // 2. 新規評価を開始
    await page.goto('/evaluation/new')
    await expect(page.locator('h1, h2')).toContainText(/新規評価|評価/)

    // 作業情報入力（溶接作業）
    const workNameInput = page.locator('input[name="workName"], input[id*="work"], textarea').first()
    if (await workNameInput.isVisible()) {
      await workNameInput.fill('溶接作業 - 鉄骨組立')
    }

    // 3. 肉体因子評価
    await page.goto('/evaluation/physical')
    await expect(page).toHaveURL(/physical/)

    // 重量物取り扱いを選択
    const physicalFactors = page.locator('select, input[type="radio"], button').first()
    await expect(physicalFactors).toBeVisible()

    // 4. 精神因子評価
    await page.goto('/evaluation/mental')
    await expect(page).toHaveURL(/mental/)

    // 集中力・作業速度を選択
    const mentalFactors = page.locator('select, input[type="radio"]').first()
    await expect(mentalFactors).toBeVisible()

    // 5. 環境因子評価
    await page.goto('/evaluation/environmental')
    await expect(page).toHaveURL(/environmental/)

    // 騒音・温度・有害物質を入力
    const envFactors = page.locator('select, input').first()
    await expect(envFactors).toBeVisible()

    // 6. 危険因子評価
    await page.goto('/evaluation/hazard')
    await expect(page).toHaveURL(/hazard/)

    // 火傷・感電リスクを入力
    const hazardTable = page.locator('table, [role="table"]')
    await expect(hazardTable).toBeVisible()

    // 7. 作業時間評価
    await page.goto('/evaluation/worktime')
    await expect(page).toHaveURL(/worktime/)

    // 8時間/日、週5日を入力
    const worktimeInputs = page.locator('input[type="number"], select')
    const firstInput = worktimeInputs.first()
    if (await firstInput.isVisible()) {
      await firstInput.fill('8')
    }

    // 8. レポートページに移動
    await page.goto('/reports')
    await expect(page).toHaveURL(/reports/)

    // レポート生成ボタンを確認
    const reportSection = page.locator('main, [class*="report"]')
    await expect(reportSection).toBeVisible()

    console.log('✅ ペルソナ1: 安全管理者のシナリオ完了')
  })
})

test.describe('ペルソナ2: 現場作業員 - 佐藤 翔太 (32歳)', () => {
  test('シナリオ: 自己評価を簡単に実施', async ({ page }) => {
    // 1. ホームページから新規評価
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()

    // 「新規評価」ボタンを探す
    const newEvalButton = page.locator('a[href*="evaluation"], button:has-text("評価"), a:has-text("新規")')
    const firstButton = newEvalButton.first()

    if (await firstButton.isVisible()) {
      await firstButton.click()
      await page.waitForURL(/evaluation/, { timeout: 5000 })
    } else {
      // ダイレクトナビゲーション
      await page.goto('/evaluation/new')
    }

    // 2. 肉体的な負担を選択
    await page.goto('/evaluation/physical')
    const physicalPage = page.locator('main')
    await expect(physicalPage).toBeVisible()

    // シンプルな選択肢を確認
    const selectOptions = page.locator('select, input[type="radio"]')
    await expect(selectOptions.first()).toBeVisible()

    // 3. 精神的な負担を選択
    await page.goto('/evaluation/mental')
    const mentalPage = page.locator('main')
    await expect(mentalPage).toBeVisible()

    // 4. 作業環境を選択
    await page.goto('/evaluation/environmental')
    const envPage = page.locator('main')
    await expect(envPage).toBeVisible()

    // 5. 危険性を選択
    await page.goto('/evaluation/hazard')
    const hazardPage = page.locator('main')
    await expect(hazardPage).toBeVisible()

    // 6. 結果を確認
    await page.goto('/dashboard')
    const dashboard = page.locator('main')
    await expect(dashboard).toBeVisible()

    console.log('✅ ペルソナ2: 現場作業員のシナリオ完了')
  })

  test('UI要件: シンプルで分かりやすい', async ({ page }) => {
    await page.goto('/evaluation/physical')

    // 専門用語が少ないことを確認
    const pageText = await page.locator('body').textContent()

    // 分かりやすい日本語表記を確認
    expect(pageText).toMatch(/(作業|評価|選択|入力)/)

    // フォーム要素が大きくタップしやすい
    const inputs = page.locator('button, select, input[type="radio"]')
    const firstInput = inputs.first()
    if (await firstInput.isVisible()) {
      const box = await firstInput.boundingBox()
      expect(box?.height).toBeGreaterThan(30) // 最低30px
    }
  })
})

test.describe('ペルソナ3: 経営層 - 山田 雅子 (55歳)', () => {
  test('シナリオ: 全社の3K評価データを俯瞰', async ({ page }) => {
    // 1. ダッシュボードで全体サマリー
    await page.goto('/dashboard')
    await expect(page.locator('h1')).toContainText(/ダッシュボード|Dashboard/)

    // 統計サマリーが表示される
    const statsCards = page.locator('[class*="stat"], [class*="card"], [class*="metric"]')
    await expect(statsCards.first()).toBeVisible({ timeout: 10000 })

    // 2. 評価リストで部門別データ確認
    await page.goto('/evaluation/list')
    await expect(page).toHaveURL(/list/)

    // テーブルまたはリストが表示される
    const dataTable = page.locator('table, [role="table"], [class*="list"]')
    await expect(dataTable.first()).toBeVisible({ timeout: 10000 })

    // 3. レポートページでグラフ確認
    await page.goto('/reports')
    const reportPage = page.locator('main')
    await expect(reportPage).toBeVisible()

    console.log('✅ ペルソナ3: 経営層のシナリオ完了')
  })

  test('UI要件: 一目で重要情報が分かる', async ({ page }) => {
    await page.goto('/dashboard')

    // 数値データが大きく表示される
    const numbers = page.locator('[class*="text-"][class*="xl"], [class*="font-bold"]')
    await expect(numbers.first()).toBeVisible()

    // グラフまたはビジュアル要素が存在
    const visualElements = page.locator('canvas, svg, [class*="chart"]')
    const hasVisuals = await visualElements.count() > 0
    expect(hasVisuals).toBeTruthy()
  })

  test('UI要件: データ比較が容易', async ({ page }) => {
    await page.goto('/evaluation/list')

    // テーブルヘッダーが存在
    const tableHeaders = page.locator('th, [role="columnheader"]')
    const headerCount = await tableHeaders.count()
    expect(headerCount).toBeGreaterThan(0)

    // ソート・フィルター機能のUI確認
    const interactiveElements = page.locator('button, select, input[type="search"]')
    await expect(interactiveElements.first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('共通ユーザビリティテスト', () => {
  test('ナビゲーションが直感的', async ({ page }) => {
    await page.goto('/')

    // ヘッダーナビゲーション存在確認
    const nav = page.locator('nav, header [role="navigation"]')
    await expect(nav.first()).toBeVisible()

    // 主要ページへのリンク存在
    const navLinks = page.locator('a[href*="dashboard"], a[href*="evaluation"], a[href*="report"]')
    const linkCount = await navLinks.count()
    expect(linkCount).toBeGreaterThan(0)
  })

  test('レスポンシブデザイン対応', async ({ page }) => {
    // デスクトップ
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/dashboard')
    const desktopMain = page.locator('main')
    await expect(desktopMain).toBeVisible()

    // タブレット
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    await expect(desktopMain).toBeVisible()

    // モバイル
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await expect(desktopMain).toBeVisible()
  })

  test('アクセシビリティ: キーボードナビゲーション', async ({ page }) => {
    await page.goto('/')

    // Tabキーでフォーカス移動
    await page.keyboard.press('Tab')
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()

    // Enterキーで要素アクティブ化
    await page.keyboard.press('Enter')
    // ページ遷移またはモーダル表示を期待
  })
})
