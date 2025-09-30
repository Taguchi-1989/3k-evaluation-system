# E2Eテストガイド - 3環境対応

## 📋 概要

このプロジェクトは **Hexagonal Architecture** を採用しており、以下の3環境で動作します：

1. **localhost** - 開発環境 (Web)
2. **Vercel** - 本番環境 (Web)
3. **Electron** - デスクトップアプリ

各環境で同じコアロジックが動作し、環境ごとに異なるアダプターを使用します。

## 🧪 テストスイート構成

### 基本テスト
- **basic.spec.ts** - 基本的なページ表示テスト
- **data-persistence.spec.ts** - データ永続化テスト

### 環境別テスト
- **cross-platform.spec.ts** - 全環境共通の互換性テスト
- **electron-compatibility.spec.ts** - Electron専用テスト
- **vercel-production.spec.ts** - Vercel本番環境テスト

## 🚀 テスト実行方法

### 1. ローカル開発環境テスト

```bash
# 開発サーバーを起動
npm run dev

# 別のターミナルでE2Eテスト実行
npm run test:e2e

# 特定のテストのみ実行
npx playwright test tests/basic.spec.ts

# UIモードで実行
npm run test:e2e:ui
```

### 2. クロスプラットフォームテスト

```bash
# 全環境の互換性テスト
npx playwright test tests/cross-platform.spec.ts

# 特定のブラウザのみ
npx playwright test --project=localhost-chromium
npx playwright test --project=localhost-firefox
```

### 3. Electronテスト

```bash
# Electronビルド
npm run build:electron

# Electronテスト実行
TEST_ELECTRON=true npx playwright test tests/electron-compatibility.spec.ts
```

### 4. Vercel本番環境テスト

```bash
# 環境変数を設定して実行
VERCEL_URL=https://your-app.vercel.app TEST_PRODUCTION=true npx playwright test tests/vercel-production.spec.ts

# または .env.test ファイルに設定
# VERCEL_URL=https://your-app.vercel.app
# TEST_PRODUCTION=true
```

## 📊 テスト項目一覧

### クロスプラットフォーム互換性テスト
- [x] 環境検出（Electron/localhost/Vercel）
- [x] Hexagonal Architectureアダプター読み込み
- [x] ストレージAPI動作確認
- [x] 評価計算ロジック一貫性
- [x] ナビゲーション動作
- [x] レスポンシブデザイン

### Electron専用テスト
- [x] アプリケーション起動
- [x] IPC通信
- [x] Electronアダプター初期化
- [x] ファイルシステムアクセス
- [x] ウィンドウサイズ設定
- [x] メニューバー表示
- [x] 自動更新機能

### Vercel本番環境テスト
- [x] HTTPS有効化
- [x] セキュリティヘッダー
- [x] Supabase統合
- [x] 評価ページ動作
- [x] エラーページ
- [x] パフォーマンス（Core Web Vitals）
- [x] レスポンシブデザイン
- [x] データ永続化

## 🔧 Playwright設定

### プロジェクト構成

```typescript
// playwright.config.ts
projects: [
  {
    name: 'localhost-chromium',
    use: { baseURL: 'http://localhost:3000' }
  },
  {
    name: 'vercel-production',
    use: { baseURL: process.env.VERCEL_URL }
  },
  {
    name: 'electron',
    testMatch: /electron.*\.spec\.ts$/
  }
]
```

### 環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `TEST_PRODUCTION` | 本番環境テスト有効化 | `true` |
| `TEST_ELECTRON` | Electronテスト有効化 | `true` |
| `VERCEL_URL` | Vercel本番URL | `https://your-app.vercel.app` |
| `DEBUG` | デバッグモード | `true` |

## 📈 CI/CD統合

### GitHub Actions ワークフロー例

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test-localhost:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install
      - run: npm run test:e2e

  test-production:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install
      - run: |
          VERCEL_URL=${{ secrets.VERCEL_URL }} \
          TEST_PRODUCTION=true \
          npx playwright test tests/vercel-production.spec.ts
```

## 🐛 トラブルシューティング

### テストがタイムアウトする
```bash
# タイムアウトを延長
npx playwright test --timeout=60000
```

### Electronテストが失敗する
```bash
# Electronビルドを確認
npm run build:electron

# dist/electron/ ディレクトリが存在することを確認
ls -la dist/electron/
```

### Vercelテストが404エラー
```bash
# VERCEL_URLが正しいか確認
echo $VERCEL_URL

# ブラウザで手動確認
curl -I $VERCEL_URL
```

## 📝 テスト追加方法

### 新しいクロスプラットフォームテスト

```typescript
// tests/cross-platform.spec.ts に追加
test('新機能が全環境で動作する', async ({ page }) => {
  await page.goto('/')

  // テストロジック
  const result = await page.evaluate(() => {
    // 新機能のテスト
  })

  expect(result).toBe(expected)
})
```

### 環境固有のテスト

```typescript
// Electron専用
test('Electron固有機能', async () => {
  test.skip(() => process.env.TEST_ELECTRON !== 'true')

  // Electronテストロジック
})

// Vercel専用
test('Vercel固有機能', async ({ page }) => {
  test.skip(() => process.env.TEST_PRODUCTION !== 'true')

  // Vercelテストロジック
})
```

## 🎯 ベストプラクティス

1. **環境検出を活用**
   - 各テストで環境を正しく検出
   - 環境固有のテストは適切にスキップ

2. **データクリーンアップ**
   - テスト後は必ずデータを削除
   - ユニークなキーを使用（タイムスタンプ等）

3. **タイムアウト設定**
   - ネットワーク依存のテストは長めに設定
   - ローカル計算は短めに設定

4. **エラーハンドリング**
   - 本番環境テストは慎重に
   - 失敗時のスクリーンショット・動画を活用

## 📚 参考資料

- [Playwright Documentation](https://playwright.dev/)
- [Hexagonal Architecture Pattern](./chrome.md)
- [Project Structure](./CLAUDE.md)

---

**最終更新**: 2025-09-30
**テストカバレッジ**: 42+ unit tests, 30+ E2E tests
