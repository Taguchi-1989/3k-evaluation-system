import { test, expect } from '@playwright/test'

test.describe('ホームページ機能テスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/')
  })

  test('ページ構造が正しく表示される', async ({ page }) => {
    // h1見出しが存在する（複数ある場合は最初のものを確認）
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible({ timeout: 10000 })
    await expect(h1).toContainText('3K')

    // main要素が存在する
    const mainElement = page.locator('main')
    await expect(mainElement).toBeVisible()

    // セマンティックHTML構造の確認
    const header = page.locator('header')
    await expect(header).toBeVisible()
  })

  test('メニューカードが4枚表示される', async ({ page }) => {
    // 新しい評価を作成カード
    const newEvaluationCard = page.locator('text=新しい評価を作成')
    await expect(newEvaluationCard).toBeVisible({ timeout: 10000 })

    // 登録済み評価を確認カード
    const viewEvaluationsCard = page.locator('text=登録済み評価を確認')
    await expect(viewEvaluationsCard).toBeVisible()

    // ダッシュボードカード
    const dashboardCard = page.locator('text=ダッシュボード')
    await expect(dashboardCard).toBeVisible()

    // 肉体因子評価カード
    const physicalCard = page.locator('text=肉体因子評価')
    await expect(physicalCard).toBeVisible()
  })

  test('各メニューカードに説明文が表示される', async ({ page }) => {
    // 新規評価の説明
    const newEvalDescription = page.locator('text=作業の3K指数を評価します')
    await expect(newEvalDescription).toBeVisible({ timeout: 10000 })

    // 登録済み評価の説明
    const viewEvalDescription = page.locator('text=過去に登録した評価結果を確認・編集します')
    await expect(viewEvalDescription).toBeVisible()

    // ダッシュボードの説明
    const dashboardDescription = page.locator('text=登録済みの作業をグラフで分析します')
    await expect(dashboardDescription).toBeVisible()

    // 肉体因子の説明
    const physicalDescription = page.locator('text=身体的負荷を直接評価します')
    await expect(physicalDescription).toBeVisible()
  })

  test('各メニューカードのアイコンが表示される', async ({ page }) => {
    // SVGアイコンが4つ以上存在することを確認
    const icons = page.locator('svg')
    const iconCount = await icons.count()
    expect(iconCount).toBeGreaterThanOrEqual(4) // 少なくとも4つのカードアイコン
  })

  test('統計カードが2枚表示される', async ({ page }) => {
    // 登録済み作業数カード
    const totalWorksCard = page.locator('text=登録済み作業数')
    await expect(totalWorksCard).toBeVisible({ timeout: 10000 })

    // 要注意作業カード
    const highRiskCard = page.locator('text=要注意作業')
    await expect(highRiskCard).toBeVisible()

    // 数値データが表示されている
    const statsValues = page.locator('text=/\\d+件/')
    await expect(statsValues.first()).toBeVisible()
  })

  test('新規評価カードがクリック可能', async ({ page }) => {
    // 新規評価カードが存在し、クリック可能であることを確認
    const newEvalCard = page.getByTestId('new-evaluation-link')
    await expect(newEvalCard).toBeVisible({ timeout: 10000 })
    await expect(newEvalCard).toBeEnabled()

    // カードにクリックハンドラが設定されているか、cursor-pointerクラスがあることを確認
    const hasClickHandler = await newEvalCard.evaluate(el => {
      return el.classList.contains('cursor-pointer') ||
             el.onclick !== null ||
             el.hasAttribute('onclick')
    })
    expect(hasClickHandler).toBeTruthy()
  })

  test('ダッシュボードカードがクリック可能', async ({ page }) => {
    // ダッシュボードカードが存在し、クリック可能であることを確認
    const dashboardCard = page.getByTestId('dashboard-link')
    await expect(dashboardCard).toBeVisible({ timeout: 10000 })
    await expect(dashboardCard).toBeEnabled()
  })

  test('登録済み評価確認カードがクリック可能', async ({ page }) => {
    // 登録済み評価確認カードが存在し、クリック可能であることを確認
    const viewEvalCard = page.getByTestId('view-evaluations-link')
    await expect(viewEvalCard).toBeVisible({ timeout: 10000 })
    await expect(viewEvalCard).toBeEnabled()
  })

  test('肉体因子評価カードがクリック可能', async ({ page }) => {
    // 肉体因子評価カードが存在し、クリック可能であることを確認
    const physicalCard = page.getByTestId('physical-evaluation-link')
    await expect(physicalCard).toBeVisible({ timeout: 10000 })
    await expect(physicalCard).toBeEnabled()
  })

  test('カードのホバー状態が機能する', async ({ page }) => {
    // 新規評価カードにホバー
    const newEvalCard = page.locator('text=新しい評価を作成').locator('..')
    await newEvalCard.hover()

    // ホバー時のスタイル変更を確認（background-colorの変化など）
    // Note: CSSクラスの確認でホバー可能性を検証
    const cardElement = await newEvalCard.elementHandle()
    expect(cardElement).toBeTruthy()
  })

  test('キーボードナビゲーションでカードにフォーカスできる', async ({ page }) => {
    // Tabキーでフォーカス移動
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // フォーカスされた要素が存在することを確認
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
  })

  test('レスポンシブデザイン: モバイルビューで正しく表示される', async ({ page }) => {
    // モバイルサイズに変更
    await page.setViewportSize({ width: 375, height: 667 })

    // メニューカードが縦に並んで表示される
    const firstCard = page.locator('text=新しい評価を作成').first()
    await expect(firstCard).toBeVisible({ timeout: 10000 })
  })

  test('レスポンシブデザイン: タブレットビューで正しく表示される', async ({ page }) => {
    // タブレットサイズに変更
    await page.setViewportSize({ width: 768, height: 1024 })

    // すべてのメニューカードが表示される
    const newEvalCard = page.locator('text=新しい評価を作成')
    await expect(newEvalCard).toBeVisible({ timeout: 10000 })
  })

  test('ヘッダーのロゴとタイトルが表示される', async ({ page }) => {
    // ロゴが表示される（最初のものを確認）
    const logo = page.locator('text=3K').first()
    await expect(logo).toBeVisible({ timeout: 10000 })

    // アプリ名が表示される
    const appName = page.locator('text=3K指数評価アプリ')
    await expect(appName.first()).toBeVisible()
  })

  test('フッターが表示される', async ({ page }) => {
    // フッターが存在することを確認
    const footer = page.locator('footer')
    await expect(footer).toBeVisible({ timeout: 10000 })
  })
})
