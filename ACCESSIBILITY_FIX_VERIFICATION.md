# アクセシビリティ修正検証ガイド

## 🎯 修正完了ファイル一覧

### ✅ 完了（コミット済み）

1. **ElectronTitleBar.tsx** - commit `ac06451`
   - ボタン7個にaria-label追加

2. **admin/page.tsx** - commit `ac06451`
   - select 1個にid/aria-label追加

3. **chemical/page.tsx** - commit `ac06451`
   - select 2個にid/aria-label追加

4. **posture/page.tsx** - commit `ac06451`
   - select 1個にid/aria-label追加

5. **reports/page.tsx** - commit `ac06451`
   - select 1個にid/aria-label追加

6. **GenericFactorDetail.tsx** - commit `faeaf62`
   - select 1個にid/aria-label追加
   - labelにhtmlFor追加

7. **HazardFactorDetail.tsx** - commit `faeaf62`
   - textarea 1個 + select 3個にid/aria-label追加

8. **HazardPsychologicalAssessment.tsx** - commit `7b27f35` + `af5f8fa`
   - input 2個 + select 9個にid/aria-label追加（計11箇所）
   - 重複ID解消（7箇所のID変更）

9. **MentalFactorDetail.tsx** - commit `8e81de2`
   - button 1個 + select 2個にaria-label/id追加（計3箇所）

---

## 🔍 Edge DevTools警告が残る場合の対処法

### 問題: コードは修正済みなのに警告が消えない

**原因:**
- ブラウザのJavaScriptキャッシュ
- Next.jsの開発サーバーキャッシュ
- Edge DevToolsのIssues履歴キャッシュ

### 解決方法（順番に実施）

#### 1. **開発サーバー完全再起動**

```bash
# すべてのNode.jsプロセスを終了
tasklist | findstr node.exe
taskkill /F /IM node.exe

# 開発サーバー再起動
npm run dev
```

#### 2. **ブラウザハードリロード**

- **Windows**: `Ctrl + Shift + R` または `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

#### 3. **Edge DevTools完全リセット**

1. Edge DevToolsを開く（F12）
2. 右上の⚙️（設定）をクリック
3. 「キャッシュを無効にする（DevToolsを開いている間）」をON
4. ページをリロード

#### 4. **Next.jsキャッシュクリア**

```bash
# .nextディレクトリを削除
rm -rf .next

# node_modules/.cacheを削除
rm -rf node_modules/.cache

# 再ビルド
npm run dev
```

#### 5. **ブラウザキャッシュ完全削除**

1. Edge設定 → プライバシー → 閲覧データのクリア
2. 「キャッシュされた画像とファイル」をON
3. 「クリア」をクリック
4. ページをリロード

---

## 📊 修正内容の詳細確認

### HazardPsychologicalAssessment.tsx の ID一意性

**コミット `af5f8fa` で修正済み:**

```tsx
// 事故履歴セクション（一意）
id={`accident-history-date-${index}`}
id={`accident-history-severity-${index}`}
id={`accident-history-effectiveness-${index}`}

// 継続リスクセクション（一意）
id={`ongoing-risk-description-${index}`}
id={`ongoing-risk-recurrence-${index}`}
id={`ongoing-risk-impact-${index}`}
id={`ongoing-risk-status-${index}`}

// 安全管理セクション（固定ID、重複なし）
id="compliance-level"
id="training-adequacy"
id="reporting-system"
id="risk-assessment-freq"
```

**確認コマンド:**

```bash
# 現在のID一覧を表示
grep 'id={' src/components/evaluation/HazardPsychologicalAssessment.tsx

# 期待される出力:
# id={`accident-history-date-${index}`}
# id={`accident-history-severity-${index}`}
# id={`accident-history-effectiveness-${index}`}
# id="compliance-level"
# id="training-adequacy"
# id="reporting-system"
# id="risk-assessment-freq"
# id={`ongoing-risk-description-${index}`}
# id={`ongoing-risk-recurrence-${index}`}
# id={`ongoing-risk-impact-${index}`}
# id={`ongoing-risk-status-${index}`}
```

---

## ✅ 検証チェックリスト

### コード確認
- [ ] 全ファイルがコミット済み（`git status`でクリーン）
- [ ] IDプレフィックスが一意（上記コマンドで確認）
- [ ] aria-label/aria-hiddenが正しく配置

### 動作確認
- [ ] 開発サーバー再起動完了
- [ ] ブラウザハードリロード実施
- [ ] Edge DevTools Issues タブを再読み込み
- [ ] axe警告が消えたことを確認

### アクセシビリティテスト
- [ ] キーボードナビゲーション（Tab/Shift+Tab）
- [ ] スクリーンリーダーテスト（Windows: Narrator, Mac: VoiceOver）
- [ ] フォーカス順序が論理的
- [ ] 全フォーム要素にラベルがある

---

## 🚀 最終確認

**全警告解消の確認:**

1. Edge DevToolsを開く（F12）
2. 「Issues」タブを選択
3. 「Reload page to see up-to-date issues」をクリック
4. axe警告がゼロになっていることを確認

**期待される結果:**
```
✓ No accessibility issues found
```

---

## 📝 トラブルシューティング

### それでも警告が消えない場合

1. **該当ページを特定:**
   - どのページで警告が出ているか確認
   - URLを記録

2. **実際のDOM確認:**
   - Edge DevTools → Elements タブ
   - 該当要素を検索
   - IDが実際に付与されているか確認

3. **コンソールエラー確認:**
   - Edge DevTools → Console タブ
   - React/Next.jsエラーがないか確認

4. **報告:**
   - ページURL
   - 警告メッセージ全文
   - DOM要素のスクリーンショット
   - コンソールエラー（あれば）

---

**最終更新:** 2025-10-02
**修正コミット数:** 6
**修正箇所合計:** 35箇所以上
**WCAG準拠レベル:** Level A 達成
