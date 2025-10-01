# ESLint警告の分類と対応方針

## 📊 警告総数: 102個

### カテゴリA: 削除対象（不要なimport） - 約15個
以下は現在も将来も使用予定がないため削除：

1. **重複import** - 他の方法で実装済み
2. **古いライブラリのimport** - 新しい実装に置き換え済み

### カテゴリB: 将来実装用（コメント+`_`prefix） - 約45個
元の意図を尊重し、将来の実装のために残す：

#### B1. UI/UX機能（将来追加予定）
- `Line`チャート (DashboardCharts) - 時系列データ表示用
- `Button` (複数ファイル) - アクション追加時に使用
- `handleBackToMain` - 戻るボタン実装時に使用

#### B2. データ機能（将来実装予定）
- `EVALUATION_STANDARDS` - 評価基準表示機能
- `DEFAULT_EVALUATION_DATA` - 初期データ設定
- `refreshData` - データリフレッシュ機能

#### B3. パフォーマンス最適化（段階的改善）
- `OptimizedImage` - `<img>`を置き換え予定
- `useEvaluationStore` - グローバル状態管理導入予定

#### B4. TODO実装待ち
- `handleFileUpload`の`files`パラメータ - ファイル処理実装待ち
- 各種`handleSave` - 保存機能実装待ち

### カテゴリC: 実装確認が必要 - 約10個
動作確認して実装するか削除するか判断：

1. **イベントハンドラ** - 定義されているがUIに接続されていない可能性
2. **State変数** - 設定されているが使用されていない可能性

### その他: 型安全性・依存配列 - 約32個
- `react-hooks/exhaustive-deps` (13個) - 依存配列の修正
- `@next/next/no-img-element` (4個) - OptimizedImage使用推奨
- 型安全性警告 (15個) - any型など

## 🎯 対応の優先順位

1. **Phase 1**: カテゴリA削除（簡単、リスク低）
2. **Phase 2**: カテゴリB対応（`_`prefix + コメント追加）
3. **Phase 3**: カテゴリC確認・対応（要検討）
4. **Phase 4**: 型安全性・依存配列の修正
5. **Phase 5**: 動作確認とコミット

## 📝 対応ルール

### カテゴリBの対応例
```typescript
// 将来実装予定: 時系列データ表示用
// import { Line } from 'react-chartjs-2'  // TODO: 月次推移グラフ実装時に使用

// 将来実装予定: ファイル処理機能
const handleFileUpload = (_files: FileList): void => {
  // TODO: ファイルアップロード処理を実装
}
```

### カテゴリCの判断基準
1. UIに対応するボタン/フォームがあるか？ → **実装漏れ**
2. コメントにTODOがあるか？ → **将来実装予定**
3. 似た機能が他にあるか？ → **重複または古いコード**
