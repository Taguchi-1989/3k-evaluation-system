# アクセシビリティ修正 引き継ぎドキュメント

## 📅 作業日時
**開始**: 2025-10-02
**最終更新**: 2025-10-02
**作業者**: Claude Code Assistant

---

## 🎯 作業の経緯と目的

### 発端
ユーザーがEdge DevToolsで以下のアクセシビリティ警告を発見:
```
Select element must have an accessible name: Element has no title attribute
Microsoft Edge Tools axe/forms
```

### 前提条件
- **前セッションの成果**: TypeScriptエラー 376→0、警告 102→10 に削減済み
- **現セッション開始時の状況**:
  - すべてのpage.tsxファイルにselect関連のアクセシビリティ警告が残存
  - ElectronTitleBar.tsxのbuttonタグにもアクセシビリティ警告あり

### ユーザーからの重要な指示
1. **初期指示**: 「すべてのpage.tsxファイルを見直してエラー対応して、特にselect関連でエラー残っていると思う」
2. **品質要求**: 「ゆっくり着実に実施して、場当たり的な解決ではなく今後を見据えてプロ品質で」
3. **追加要求**: 「ElectronTitleBar.tsxのCSS注意も対応して」
4. **作業方針**: 「サーバー再起動として対応していこう」

---

## 🔍 実施した調査

### 1. Select要素の全体把握
```bash
find src/app -name "*.tsx" -exec grep -l "<select" {} \;
```

**検出結果** (6ファイル):
1. `src/app/evaluation/environmental/chemical/page.tsx` - 2個
2. `src/app/admin/page.tsx` - 1個
3. `src/app/evaluation/physical/posture/page.tsx` - 1個
4. `src/app/reports/page.tsx` - 1個
5. `src/app/settings/page.tsx` - 2個 (138行目、197行目)
6. `src/app/test/visibility/page.tsx` - 1個 (200行目)

### 2. Button要素の調査
- `src/components/electron/ElectronTitleBar.tsx` - 7個のボタン
  - 最小化、最大化/復元、閉じる (3個)
  - ファイル、編集、表示、ヘルプメニュー (4個)

---

## ✅ 完了した修正 (5ファイル)

### 1. ElectronTitleBar.tsx ✨
**修正箇所**: 全7個のボタン

#### ウィンドウコントロールボタン (3個)
```tsx
// 最小化ボタン (77-91行目)
<button
  onClick={handleMinimize}
  className="w-12 h-8 flex items-center justify-center hover:bg-gray-200 transition-colors focus:outline-none"
  style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
  title="最小化"
  aria-label="ウィンドウを最小化"  // ← 追加
>
  <svg width="10" height="1" viewBox="0 0 10 1" className="fill-gray-600" aria-hidden="true">  // ← aria-hidden追加
    <rect width="10" height="1" />
  </svg>
</button>

// 最大化/復元ボタン (94-116行目)
<button
  onClick={handleMaximize}
  title={isMaximized ? '復元' : '最大化'}
  aria-label={isMaximized ? 'ウィンドウを復元' : 'ウィンドウを最大化'}  // ← 追加
>
  {isMaximized ? (
    <svg aria-hidden="true">...</svg>  // ← aria-hidden追加
  ) : (
    <svg aria-hidden="true">...</svg>  // ← aria-hidden追加
  )}
</button>

// 閉じるボタン (119-133行目)
<button
  onClick={handleClose}
  title="閉じる"
  aria-label="アプリケーションを閉じる"  // ← 追加
>
  <svg aria-hidden="true">...</svg>  // ← aria-hidden追加
</button>
```

#### メニューバーボタン (4個)
```tsx
// ファイルメニュー (167-178行目)
<button
  onClick={() => handleMenuClick('file')}
  aria-label="ファイルメニューを開く"  // ← 追加
>
  ファイル
</button>

// 編集メニュー (182-193行目)
<button
  onClick={() => handleMenuClick('edit')}
  aria-label="編集メニューを開く"  // ← 追加
>
  編集
</button>

// 表示メニュー (197-208行目)
<button
  onClick={() => handleMenuClick('view')}
  aria-label="表示メニューを開く"  // ← 追加
>
  表示
</button>

// ヘルプメニュー (211-223行目)
<button
  onClick={() => handleMenuClick('help')}
  aria-label="ヘルプメニューを開く"  // ← 追加
>
  ヘルプ
</button>
```

**修正のポイント**:
- すべてのボタンに`aria-label`を追加
- 装飾的なSVGに`aria-hidden="true"`を追加
- 既存の`title`属性は維持（ツールチップ表示用）

---

### 2. chemical/page.tsx
**修正箇所**: 2個のselect要素

#### Select 1: 物質の種類 (150-156行目 → 修正後)
```tsx
<label htmlFor="substance-type" className="block text-sm font-medium mb-1">
  種類
</label>
<select
  id="substance-type"
  value={newSubstance.type || 'gas'}
  onChange={(e) => setNewSubstance(prev => ({...prev, type: e.target.value}))}
  className="w-full p-2 border border-gray-300 rounded-md text-sm"
  aria-label="物質の種類を選択"
>
  <option value="gas">ガス</option>
  <option value="vapor">蒸気</option>
  <option value="dust">粉塵</option>
  <option value="mist">ミスト</option>
</select>
```

#### Select 2: 物質の単位 (159-165行目 → 修正後)
```tsx
<label htmlFor="substance-unit" className="block text-sm font-medium mb-1">
  単位
</label>
<select
  id="substance-unit"
  value={newSubstance.unit || 'ppm'}
  onChange={(e) => setNewSubstance(prev => ({...prev, unit: e.target.value}))}
  className="w-full p-2 border border-gray-300 rounded-md text-sm"
  aria-label="物質の単位を選択"
>
  <option value="ppm">ppm</option>
  <option value="mg/m3">mg/m³</option>
  <option value="fibers/cc">fibers/cc</option>
</select>
```

---

### 3. admin/page.tsx
**修正箇所**: 1個のselect要素

#### ユーザーロール選択 (修正後)
```tsx
<label htmlFor={`role-select-${userItem.id}`} className="text-sm font-medium">
  ロール
</label>
<select
  id={`role-select-${userItem.id}`}
  value={newRole}
  onChange={e => setNewRole(e.target.value as UserRole)}
  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
  aria-label={`${userItem.name}のロールを選択`}
>
  <option value="viewer">閲覧者</option>
  <option value="evaluator">評価者</option>
  <option value="admin">管理者</option>
</select>
```

**特徴**:
- 動的な`id`と`aria-label`（ユーザーごとに異なる）
- ダークモード対応のクラス名維持

---

### 4. posture/page.tsx
**修正箇所**: 1個のselect要素

#### 負荷レベル選択 (修正後)
```tsx
<label htmlFor="load-level" className="block text-sm font-medium mb-1">
  負荷レベル
</label>
<select
  id="load-level"
  className="w-full p-2 border border-gray-300 rounded-md"
  aria-label="負荷レベルを選択"
>
  <option value="light">軽い</option>
  <option value="moderate">中程度</option>
  <option value="heavy">重い</option>
</select>
```

---

### 5. reports/page.tsx
**修正箇所**: 1個のselect要素

#### 評価対象選択 (修正後)
```tsx
<label htmlFor="target-evaluation" className="text-sm font-medium">
  対象評価:
</label>
<select
  id="target-evaluation"
  value={selectedEvaluationId}
  onChange={(e) => setSelectedEvaluationId(e.target.value)}
  className="p-2 border rounded text-sm"
  aria-label="レポート対象の評価を選択"
>
  <option value="">選択してください</option>
  {mockEvaluations.map(ev => (
    <option key={ev.id} value={ev.id}>{ev.name}</option>
  ))}
</select>
```

---

## ⚠️ 未完了の修正 (2ファイル - 手動対応必要)

### 問題の詳細
**原因**: Next.js開発サーバーのHot Module Reload (HMR)が干渉
**症状**: Editツールで変更を試みると「File has been unexpectedly modified」エラー
**試行した解決策**:
1. 開発サーバー停止 (`KillShell`) → 効果なし
2. Nodeプロセス直接kill → 効果なし
3. Pythonスクリプトでの一括置換 → UnicodeEncodeError
4. sedコマンドでの置換 → HMRが変更を上書き

**残存プロセス** (作業時点):
- PID 37412: ポート3000の開発サーバー (1.5GB メモリ使用)
- PID 20584: 別の開発サーバー (1.2GB メモリ使用)
- その他23個のnode.exeプロセス

---

### 6. settings/page.tsx ⚠️
**未修正箇所**: 2個のselect要素

#### Select 1: ログイン方法 (138-143行目)
**現状**:
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    ログイン方法
  </label>
  <select
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
    disabled
  >
    <option>社内認証システム</option>
  </select>
  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
    現在は社内認証システムのみ利用可能です
  </p>
</div>
```

**必要な修正**:
```tsx
<div>
  <label htmlFor="login-method" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    ログイン方法
  </label>
  <select
    id="login-method"
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
    disabled
    aria-label="ログイン方法を選択"
  >
    <option>社内認証システム</option>
  </select>
  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
    現在は社内認証システムのみ利用可能です
  </p>
</div>
```

**変更点**:
1. `<label>`に`htmlFor="login-method"`追加
2. `<select>`に`id="login-method"`追加
3. `<select>`に`aria-label="ログイン方法を選択"`追加
4. `<select `を`<select`に修正（タグの空白削除）

---

#### Select 2: 言語設定 (197-206行目)
**現状**:
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    言語設定
  </label>
  <select
    name="language"
    value={formData.language}
    onChange={handleInputChange}
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
  >
    <option value="ja">日本語</option>
    <option value="en">English</option>
  </select>
</div>
```

**必要な修正**:
```tsx
<div>
  <label htmlFor="language-setting" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    言語設定
  </label>
  <select
    id="language-setting"
    name="language"
    value={formData.language}
    onChange={handleInputChange}
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
    aria-label="言語を選択"
  >
    <option value="ja">日本語</option>
    <option value="en">English</option>
  </select>
</div>
```

**変更点**:
1. `<label>`に`htmlFor="language-setting"`追加
2. `<select>`に`id="language-setting"`追加
3. `<select>`に`aria-label="言語を選択"`追加
4. `<select `を`<select`に修正（タグの空白削除）

---

### 7. test/visibility/page.tsx ⚠️
**未修正箇所**: 1個のselect要素

#### Select: テスト用セレクトボックス (200-204行目)
**現状**:
```tsx
<div>
  <label className="block text-sm font-medium mb-1">
    セレクトボックス
  </label>
  <select className="w-full p-2 border rounded">
    <option>オプション1</option>
    <option>オプション2</option>
    <option>オプション3</option>
  </select>
</div>
```

**必要な修正**:
```tsx
<div>
  <label htmlFor="test-select" className="block text-sm font-medium mb-1">
    セレクトボックス
  </label>
  <select
    id="test-select"
    className="w-full p-2 border rounded"
    aria-label="テスト用セレクトボックス"
  >
    <option>オプション1</option>
    <option>オプション2</option>
    <option>オプション3</option>
  </select>
</div>
```

**変更点**:
1. `<label>`に`htmlFor="test-select"`追加
2. `<select>`に`id="test-select"`追加
3. `<select>`に`aria-label="テスト用セレクトボックス"`追加

---

## 📋 修正パターンまとめ

### Select要素の標準パターン
```tsx
// 修正前
<div>
  <label className="...">ラベルテキスト</label>
  <select className="...">
    <option>値</option>
  </select>
</div>

// 修正後
<div>
  <label htmlFor="unique-id" className="...">ラベルテキスト</label>
  <select
    id="unique-id"
    className="..."
    aria-label="日本語の説明文"
  >
    <option>値</option>
  </select>
</div>
```

### Button要素の標準パターン
```tsx
// 修正前
<button onClick={handler} title="ツールチップ">
  <svg>...</svg>
</button>

// 修正後
<button onClick={handler} title="ツールチップ" aria-label="アクション説明">
  <svg aria-hidden="true">...</svg>
</button>
```

### 重要ポイント
1. **id属性**: 各ページ内でユニークな値を使用
2. **htmlFor属性**: labelのhtmlFor値とselectのid値を一致させる
3. **aria-label**: 日本語で明確な説明を記述
4. **aria-hidden="true"**: 装飾的なSVGには必須
5. **既存属性の維持**: `title`、`className`、イベントハンドラなどは削除しない

---

## 🔧 作業手順（次回対応時）

### 1. 開発サーバーの完全停止
```bash
# すべてのバックグラウンドシェル確認
/bashes

# 開発サーバー停止
KillShell [shell_id_1]
KillShell [shell_id_2]

# Nodeプロセス確認
tasklist | grep -i node

# 必要に応じて強制終了
taskkill /F /PID [pid]

# 5秒待機
sleep 5
```

### 2. ファイル修正（HMR干渉回避）
```bash
# バックアップ作成
cp src/app/settings/page.tsx src/app/settings/page.tsx.bak
cp src/app/test/visibility/page.tsx src/app/test/visibility/page.tsx.bak

# 修正実施（Editツールまたは手動）
# settings/page.tsx: 138行目と197行目のselect
# test/visibility/page.tsx: 200行目のselect
```

### 3. 修正内容の確認
```bash
# 修正確認
grep -A 5 'id="login-method"' src/app/settings/page.tsx
grep -A 5 'id="language-setting"' src/app/settings/page.tsx
grep -A 5 'id="test-select"' src/app/test/visibility/page.tsx
```

### 4. 開発サーバー再起動
```bash
cd c:/Users/tgch1/Desktop/ZBC-migration-kit/3K-app
npm run dev
```

### 5. Edge DevToolsで検証
1. ブラウザでアプリを開く
2. F12でDevToolsを開く
3. **Accessibility**タブまたは**axe DevTools**で確認
4. 警告「Select element must have an accessible name」が消えていることを確認

---

## 📊 進捗状況

### 完了状況
- ✅ **5ファイル完了** (ElectronTitleBar + 4 page.tsx)
- ⚠️ **2ファイル未完了** (settings + test/visibility)
- 📈 **進捗率**: 71% (5/7ファイル)

### Select要素の修正状況
- ✅ 完了: 5個 / 8個 (62.5%)
- ⚠️ 未完了: 3個 / 8個 (37.5%)

### Button要素の修正状況
- ✅ 完了: 7個 / 7個 (100%)

---

## 🐛 発生した技術的問題

### 1. HMR (Hot Module Reload) 干渉
**症状**:
```
Error: File has been unexpectedly modified. Read it again before attempting to write it.
```

**原因**:
- Next.js 15.5の開発サーバーがファイル変更を検知して自動リロード
- Editツールの変更とHMRのリロードが競合
- Tailwind CSSのPostCSS処理も並行実行されている

**試行した解決策**:
1. `KillShell`でシェル停止 → 効果なし（バックグラウンドプロセスが残存）
2. `taskkill`でプロセス強制終了 → 一部のみ成功
3. `sleep`で待機 → HMRがすぐに再起動
4. Pythonスクリプト作成 → UnicodeEncodeError（Windows CP932）
5. sedコマンド → HMRが変更を上書き

**根本原因**:
- 複数の開発サーバーが同時起動（ポート3000, 3003）
- Next.jsのファイル監視システムが即座に反応

### 2. 文字エンコーディング問題
**症状**:
```python
UnicodeEncodeError: 'cp932' codec can't encode character '\u2705' in position 0
```

**原因**: Windowsのコンソール（CP932）が絵文字を処理できない

**対処**: 絵文字を通常テキストに変更（例: ✅ → OK）

### 3. 複数の開発サーバー起動
**検出されたプロセス**:
- Shell ID 489a8b: `npm run dev` (ポート3003)
- Shell ID 36a10f: `cd ... && npm run dev` (ポート不明)
- PID 37412: Node.exe (1.5GB メモリ) - ポート3000
- PID 20584: Node.exe (1.2GB メモリ)
- その他23個のNode.exeプロセス

---

## 📁 作成したファイル

### 1. fix-select-accessibility.py
**場所**: `c:/Users/tgch1/Desktop/ZBC-migration-kit/3K-app/fix-select-accessibility.py`
**目的**: HMR回避のためのPython一括置換スクリプト
**状態**: UnicodeEncodeErrorで実行失敗
**保存理由**: 修正後に再利用可能

### 2. *.tsx.bak (バックアップファイル)
**場所**: `src/app/settings/page.tsx.bak`
**内容**: 修正前のオリジナルファイル
**用途**: 修正失敗時のロールバック

---

## 🚀 次回作業の推奨手順

### Phase 1: 環境準備（5分）
```bash
# 1. すべての開発サーバー停止
/bashes  # 実行中シェル確認
KillShell [各shell_id]  # すべて停止

# 2. Nodeプロセス完全停止
tasklist | grep -i node
taskkill /F /IM node.exe  # 全Nodeプロセス強制終了

# 3. 10秒待機
sleep 10

# 4. 作業ディレクトリへ移動
cd c:/Users/tgch1/Desktop/ZBC-migration-kit/3K-app
```

### Phase 2: ファイル修正（10分）
手動でエディタを開いて修正:

#### settings/page.tsx
1. 135行目: `<label className=` → `<label htmlFor="login-method" className=`
2. 138行目: `<select ` → `<select` (空白削除)
3. 139行目（selectタグ直後）: `id="login-method"`と`aria-label="ログイン方法を選択"`を追加

4. 194行目: `<label className=` → `<label htmlFor="language-setting" className=`
5. 197行目: `<select ` → `<select` (空白削除)
6. 198行目（selectタグ直後）: `id="language-setting"`と`aria-label="言語を選択"`を追加

#### test/visibility/page.tsx
1. 197行目: `<label className=` → `<label htmlFor="test-select" className=`
2. 200行目: `<select className=` → `<select`
3. 201行目（selectタグ直後）: `id="test-select"`と`aria-label="テスト用セレクトボックス"`を追加

### Phase 3: 確認（5分）
```bash
# 1. 修正確認
grep -n 'id="login-method"' src/app/settings/page.tsx
grep -n 'id="language-setting"' src/app/settings/page.tsx
grep -n 'id="test-select"' src/app/test/visibility/page.tsx

# 2. TypeScriptエラー確認
npx tsc --noEmit

# 3. 開発サーバー起動
npm run dev
```

### Phase 4: 検証（5分）
1. ブラウザで http://localhost:3000 を開く
2. 以下のページにアクセスして確認:
   - `/settings` - ログイン方法と言語設定のselect
   - `/test/visibility` - テスト用select
3. F12でEdge DevToolsを開く
4. **Issues**タブまたは**axe DevTools**を確認
5. アクセシビリティ警告が0件になったことを確認

---

## 📚 参考情報

### アクセシビリティ標準
- **WCAG 2.1 Level AA**: フォーム要素に明確なラベルが必要
- **ARIA 1.2**: `aria-label`でアクセシブルな名前を提供
- **HTML5**: `<label>`の`for`属性（Reactでは`htmlFor`）

### Next.js関連
- **バージョン**: 15.5.0
- **HMR**: Fast Refreshが有効（開発サーバー起動時）
- **Tailwind CSS**: v4系（PostCSS処理あり）

### 参考ドキュメント
- [MDN: ARIA Labels](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label)
- [WebAIM: Form Labels](https://webaim.org/techniques/forms/controls)
- [axe DevTools Rules](https://www.deque.com/axe/core-documentation/api-documentation/)

---

## ✅ チェックリスト（次回作業時）

### 作業前
- [ ] すべての開発サーバーを停止
- [ ] Nodeプロセスを完全終了
- [ ] 10秒待機して安定化
- [ ] バックアップファイルを作成

### 修正時
- [ ] settings/page.tsx の138行目selectを修正（login-method）
- [ ] settings/page.tsx の197行目selectを修正（language-setting）
- [ ] test/visibility/page.tsx の200行目selectを修正（test-select）
- [ ] `<select `の空白を削除（3箇所）

### 確認時
- [ ] grepコマンドで各idが存在することを確認
- [ ] TypeScriptコンパイルエラーなし
- [ ] 開発サーバーが正常起動
- [ ] Edge DevToolsでアクセシビリティ警告0件

### 完了時
- [ ] ACCESSIBILITY_HANDOVER.md を更新
- [ ] CLAUDE.md に作業記録を追記
- [ ] Gitコミット（オプション）

---

## 💡 教訓と今後の改善

### 学んだこと
1. **HMRの強力さ**: Next.jsのファイル監視は非常に高速で、ツールベースの編集と競合する
2. **プロセス管理の重要性**: 複数の開発サーバーが起動していると制御困難
3. **手動編集の価値**: HMR干渉時は、開発サーバー完全停止→手動編集→再起動が最も確実

### 改善提案
1. **作業前の環境クリーンアップ**: 開発サーバーを必ず停止してから修正作業を開始
2. **バッチ処理の活用**: 複数ファイルの同時修正は、サーバー停止中に一括実行
3. **検証の自動化**: アクセシビリティテストをCIパイプラインに組み込む

---

## 📞 問い合わせ先

**作成者**: Claude Code Assistant
**セッション日**: 2025-10-02
**プロジェクト**: 3K評価システム
**作業ディレクトリ**: `c:\Users\tgch1\Desktop\ZBC-migration-kit\3K-app`

---

## 📝 メモ

### 重要な注意事項
⚠️ **このドキュメント作成時点で、2つの開発サーバーがバックグラウンドで稼働中です**

```
Shell ID 489a8b: npm run dev (ポート3003)
Shell ID 36a10f: cd ... && npm run dev
```

**次回作業開始時は、これらを必ず停止してください。**

### 成功の鍵
✨ **「プロ品質」を実現するために**:
- 一貫したパターンの適用
- アクセシビリティ標準への準拠
- 既存コードへの影響最小化
- 段階的な実装とテスト

---

**最終更新**: 2025-10-02
**次回作業**: settings/page.tsx と test/visibility/page.tsx の修正完了
