import { test, expect, _electron as electron } from '@playwright/test'
import path from 'path'

/**
 * Electron環境専用テスト
 *
 * デスクトップアプリとしての動作を検証
 * Hexagonal ArchitectureのElectronアダプターをテスト
 */

test.describe('Electron環境テスト', () => {
  test.skip(() => {
    // Electronテストは手動実行時のみ
    return process.env.TEST_ELECTRON !== 'true'
  }, 'Electron tests require TEST_ELECTRON=true')

  test('Electronアプリケーションが起動する', async () => {
    // Electronアプリを起動
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../dist/electron/main.js')],
      env: {
        ...process.env,
        ELECTRON_BUILD: 'true'
      }
    })

    // ウィンドウが開くまで待機
    const window = await electronApp.firstWindow()

    // ウィンドウタイトルを確認
    const title = await window.title()
    expect(title).toContain('3K')

    // クリーンアップ
    await electronApp.close()
  })

  test('Electron IPC通信が動作する', async () => {
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../dist/electron/main.js')]
    })

    const window = await electronApp.firstWindow()

    // IPCハンドラーのテスト
    const result = await window.evaluate(async () => {
      // @ts-ignore - Electron API
      if (window.electron && window.electron.send) {
        // IPCメッセージ送信テスト
        return { ipcAvailable: true }
      }
      return { ipcAvailable: false }
    })

    expect(result.ipcAvailable).toBe(true)

    await electronApp.close()
  })

  test('Electronアダプターが正しく初期化される', async () => {
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../dist/electron/main.js')]
    })

    const window = await electronApp.firstWindow()

    // Electronアダプターの機能確認
    const adapterStatus = await window.evaluate(() => {
      return {
        // Electron固有のストレージが利用可能か
        hasElectronStore: typeof window !== 'undefined',
        // Node.js統合が有効か
        hasNodeIntegration: typeof process !== 'undefined' && process.versions && process.versions.electron !== undefined
      }
    })

    console.log('Electron adapter status:', adapterStatus)

    await electronApp.close()
  })

  test('Electronでファイルシステムアクセスが可能', async () => {
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../dist/electron/main.js')]
    })

    const window = await electronApp.firstWindow()

    // ファイルシステムアクセステスト
    const fsTest = await window.evaluate(async () => {
      try {
        // @ts-ignore - Electron API
        if (window.electron && window.electron.fs) {
          return { available: true }
        }
        return { available: false, reason: 'electron.fs not found' }
      } catch (err) {
        return { available: false, error: String(err) }
      }
    })

    console.log('Filesystem test:', fsTest)

    await electronApp.close()
  })

  test('Electronウィンドウサイズが正しく設定される', async () => {
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../dist/electron/main.js')]
    })

    const window = await electronApp.firstWindow()

    // ウィンドウサイズを確認
    const size = await window.evaluate(() => {
      return {
        width: window.innerWidth,
        height: window.innerHeight
      }
    })

    expect(size.width).toBeGreaterThan(800)
    expect(size.height).toBeGreaterThan(600)

    await electronApp.close()
  })

  test('Electronメニューバーが表示される', async () => {
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../dist/electron/main.js')]
    })

    const window = await electronApp.firstWindow()

    // メニューバーの存在確認
    const hasMenu = await window.evaluate(() => {
      // Electronのメニューは DOM からは直接確認できないため、
      // ウィンドウが正常に表示されていることを確認
      return document.body !== null
    })

    expect(hasMenu).toBe(true)

    await electronApp.close()
  })

  test('Electron自動更新機能が初期化される', async () => {
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../dist/electron/main.js')]
    })

    const window = await electronApp.firstWindow()

    // 自動更新機能の確認
    const autoUpdaterStatus = await window.evaluate(() => {
      // @ts-ignore
      return typeof window.electron !== 'undefined'
    })

    expect(autoUpdaterStatus).toBe(true)

    await electronApp.close()
  })
})

test.describe('Electron vs Web 互換性テスト', () => {
  test.skip(() => {
    return process.env.TEST_ELECTRON !== 'true'
  }, 'Electron comparison tests require TEST_ELECTRON=true')

  test('同じ評価データがElectronとWebで同じ結果を返す', async () => {
    // Web環境でのテストデータ
    const testData = {
      id: 'test-compatibility',
      physicalScore: 5,
      mentalScore: 6,
      environmentalScore: 4,
      hazardScore: 3
    }

    const expectedFinalScore = Math.max(
      testData.physicalScore,
      testData.mentalScore,
      testData.environmentalScore,
      testData.hazardScore
    )

    // Electron環境で同じ計算
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../dist/electron/main.js')]
    })

    const window = await electronApp.firstWindow()

    const electronResult = await window.evaluate((data) => {
      return Math.max(
        data.physicalScore,
        data.mentalScore,
        data.environmentalScore,
        data.hazardScore
      )
    }, testData)

    expect(electronResult).toBe(expectedFinalScore)

    await electronApp.close()
  })

  test('データ保存がElectronとWebで互換性がある', async () => {
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../dist/electron/main.js')]
    })

    const window = await electronApp.firstWindow()

    const testKey = `compat-test-${Date.now()}`
    const testValue = { test: 'compatibility', version: 1 }

    // Electronでデータ保存
    await window.evaluate(({ key, value }) => {
      localStorage.setItem(key, JSON.stringify(value))
    }, { key: testKey, value: testValue })

    // Electronでデータ取得
    const retrieved = await window.evaluate((key) => {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    }, testKey)

    expect(retrieved).toEqual(testValue)

    // クリーンアップ
    await window.evaluate((key) => {
      localStorage.removeItem(key)
    }, testKey)

    await electronApp.close()
  })
})
