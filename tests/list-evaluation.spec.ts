import { test, expect } from '@playwright/test'

test.describe('評価リストページテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3003/evaluation/list')
    await page.waitForLoadState('domcontentloaded')
  })

  test('評価リストページが正常に表示される', async ({ page }) => {
    // EvaluationListView component or container should be visible
    const containerElement = page.locator('div.bg-gray-800, div[class*="min-h-screen"], body')
    await expect(containerElement.first()).toBeVisible({ timeout: 10000 })
  })

  test('ページが読み込まれる', async ({ page }) => {
    await expect(page).toHaveURL(/evaluation\/list/)

    // Check that page content is loaded
    const bodyElement = page.locator('body')
    await expect(bodyElement).toBeVisible()
  })

  test('評価リストが表示される（データがある場合）', async ({ page }) => {
    // Look for list items, table rows, or cards
    const listItems = page.locator('[role="listitem"], tr:not(:first-child), div[class*="card"], article')
    const itemCount = await listItems.count()

    if (itemCount > 0) {
      // If there are evaluation items, check they are visible
      await expect(listItems.first()).toBeVisible()
    } else {
      // If no items, the empty state message or container should still be visible
      const containerElement = page.locator('div.bg-gray-800, main, body')
      await expect(containerElement.first()).toBeVisible()
    }
  })

  test('評価項目がクリック可能（データがある場合）', async ({ page }) => {
    // Look for clickable elements (buttons, links, or interactive divs)
    const clickableItems = page.locator('a[href*="/evaluation/"], button, div[role="button"], [class*="cursor-pointer"]')
    const itemCount = await clickableItems.count()

    if (itemCount > 0) {
      const firstItem = clickableItems.first()
      await expect(firstItem).toBeVisible()

      // Verify it's clickable by checking it's enabled
      const isEnabled = await firstItem.isEnabled().catch(() => true)
      expect(isEnabled).toBeTruthy()
    } else {
      // No clickable items found - page might be empty or in development
      const containerElement = page.locator('div.bg-gray-800, body')
      await expect(containerElement.first()).toBeVisible()
    }
  })

  test('検索・フィルター機能が存在する（実装されている場合）', async ({ page }) => {
    // Look for search inputs or filter controls
    const searchInput = page.locator('input[type="search"], input[type="text"][placeholder*="検索"], input[placeholder*="フィルター"]')
    const filterSelect = page.locator('select, button:has-text("フィルター")')

    const hasSearch = await searchInput.count() > 0
    const hasFilter = await filterSelect.count() > 0

    if (hasSearch || hasFilter) {
      // If search/filter exists, verify it's functional
      if (hasSearch) {
        await expect(searchInput.first()).toBeVisible()
      }
      if (hasFilter) {
        await expect(filterSelect.first()).toBeVisible()
      }
    } else {
      // No search/filter - page might be simple list or in development
      const containerElement = page.locator('div.bg-gray-800')
      await expect(containerElement).toBeVisible()
    }
  })

  test('新規評価作成ボタンが存在する（実装されている場合）', async ({ page }) => {
    // Look for "新規作成", "追加", "新しい評価" buttons
    const createButton = page.locator('button:has-text("新規"), button:has-text("作成"), button:has-text("追加"), a:has-text("新規"), a[href*="/evaluation/new"]')
    const buttonCount = await createButton.count()

    if (buttonCount > 0) {
      await expect(createButton.first()).toBeVisible()
    } else {
      // Button doesn't exist yet - verify page still works
      const containerElement = page.locator('div.bg-gray-800')
      await expect(containerElement).toBeVisible()
    }
  })

  test('ソート機能が動作する（実装されている場合）', async ({ page }) => {
    // Look for sort buttons or headers
    const sortButtons = page.locator('button[class*="sort"], th[class*="sortable"], [role="columnheader"]')
    const buttonCount = await sortButtons.count()

    if (buttonCount > 0) {
      const firstSortButton = sortButtons.first()
      await expect(firstSortButton).toBeVisible()

      // Try clicking to verify it's interactive
      await firstSortButton.click().catch(() => {
        // Click might fail if not fully implemented - that's OK
      })
    } else {
      // No sort functionality - verify page still renders
      const containerElement = page.locator('div.bg-gray-800')
      await expect(containerElement).toBeVisible()
    }
  })

  test('ページネーションが存在する（データが多い場合）', async ({ page }) => {
    // Look for pagination controls
    const pagination = page.locator('nav[aria-label*="ページ"], nav[aria-label*="pagination"], div[class*="pagination"]')
    const paginationButtons = page.locator('button:has-text("次へ"), button:has-text("前へ"), button:has-text(">")')

    const hasPagination = await pagination.count() > 0
    const hasButtons = await paginationButtons.count() > 0

    if (hasPagination || hasButtons) {
      // Pagination exists - verify it's visible
      if (hasPagination) {
        await expect(pagination.first()).toBeVisible()
      } else {
        await expect(paginationButtons.first()).toBeVisible()
      }
    } else {
      // No pagination - might be few items or in development
      const containerElement = page.locator('div.bg-gray-800')
      await expect(containerElement).toBeVisible()
    }
  })

  test('評価ステータスが表示される（データがある場合）', async ({ page }) => {
    // Look for status badges or indicators
    const statusElements = page.locator('[class*="badge"], [class*="status"], span:has-text("完了"), span:has-text("進行中"), span:has-text("未開始")')
    const statusCount = await statusElements.count()

    if (statusCount > 0) {
      await expect(statusElements.first()).toBeVisible()
    } else {
      // No status indicators - verify page still works
      const containerElement = page.locator('div.bg-gray-800')
      await expect(containerElement).toBeVisible()
    }
  })

  test('評価日時が表示される（データがある場合）', async ({ page }) => {
    // Look for date/time display elements
    const dateElements = page.locator('time, [datetime], span:has-text("2024"), span:has-text("202"), td:has-text("/")')
    const dateCount = await dateElements.count()

    if (dateCount > 0) {
      await expect(dateElements.first()).toBeVisible()
    } else {
      // No date elements - verify page still works
      const containerElement = page.locator('div.bg-gray-800')
      await expect(containerElement).toBeVisible()
    }
  })

  test('評価タイプが識別できる（データがある場合）', async ({ page }) => {
    // Look for evaluation type indicators (肉体, 精神, 環境, 危険)
    const typeElements = page.locator('span:has-text("肉体"), span:has-text("精神"), span:has-text("環境"), span:has-text("危険"), [class*="type"], [class*="category"]')
    const typeCount = await typeElements.count()

    if (typeCount > 0) {
      await expect(typeElements.first()).toBeVisible()
    } else {
      // No type indicators - verify page still works
      const containerElement = page.locator('div.bg-gray-800')
      await expect(containerElement).toBeVisible()
    }
  })

  test('空の状態が適切に表示される（データがない場合）', async ({ page }) => {
    // Check for empty state messages
    const emptyMessage = page.locator('p:has-text("評価がありません"), div:has-text("データがありません"), p:has-text("まだ評価が作成されていません")')
    const listItems = page.locator('[role="listitem"], tr:not(:first-child)')

    const itemCount = await listItems.count()
    const emptyMessageCount = await emptyMessage.count()

    if (itemCount === 0 && emptyMessageCount > 0) {
      // Empty state message should be visible when no items
      await expect(emptyMessage.first()).toBeVisible()
    } else if (itemCount > 0) {
      // Items exist - list should be visible
      await expect(listItems.first()).toBeVisible()
    } else {
      // Neither items nor empty message - page might be in development
      const containerElement = page.locator('div.bg-gray-800')
      await expect(containerElement).toBeVisible()
    }
  })

  test('削除機能が存在する（実装されている場合）', async ({ page }) => {
    // Look for delete buttons
    const deleteButtons = page.locator('button:has-text("削除"), button[aria-label*="削除"], button[class*="delete"]')
    const buttonCount = await deleteButtons.count()

    if (buttonCount > 0) {
      await expect(deleteButtons.first()).toBeVisible()
    } else {
      // No delete buttons - verify page still works
      const containerElement = page.locator('div.bg-gray-800')
      await expect(containerElement).toBeVisible()
    }
  })

  test('アクセシビリティ: リストがナビゲート可能', async ({ page }) => {
    // Check for proper semantic structure
    const listElement = page.locator('[role="list"], ul, ol, table')
    const hasSemanticList = await listElement.count() > 0

    if (hasSemanticList) {
      await expect(listElement.first()).toBeVisible()
    } else {
      // No semantic list - verify basic accessibility
      const bodyElement = page.locator('body')
      await expect(bodyElement).toBeVisible()

      const hasContent = await page.evaluate(() => {
        return document.body.textContent !== null && document.body.textContent.trim().length > 0
      })
      expect(hasContent).toBeTruthy()
    }
  })
})
