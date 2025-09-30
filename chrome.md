# chrome.md — Claude Code用ワークオーダー（Web+Electron 並行開発テンプレ）

> **目的**: Web（Vercel+Supabase）と Desktop（Electron）を同一コードベースで破綻なく実装するための、Claude Code/コーディングAIに渡す"実行可能な指示書"。
>
> **思想**: Hexagonal（Ports & Adapters）で副作用を周辺に隔離し、コア（UI+ドメイン）を純TypeScriptに保つ。

---

## 0. 作業原則（AIアシスタントへの厳守事項）

* **共有レイヤーでNode/DOM依存禁止**（`fs`, `path`, `process`, `window` に触れない）。
* **実行時注入**で差し替え（`if (isElectron)`などのビルド時分岐は不可）。
* **インターフェース→実装**の順で必ず進める（先にPortから）。
* JSON/設定は **zodで型検証** + `version`付きマイグレーション必須。
* すべての外部I/Oは **Port 経由**で行う（直参照禁止）。
* 変更は **小PR/小コミット**（<200行目安）+ 自動テスト必須。

---

## 1. リポジトリ構成（monorepo）

```
apps/
  web/                  # Vite/Next app（Vercel）
  desktop/              # Electron（Vite + electron-builder）
packages/
  core/                 # ドメイン/状態/ユースケース（副作用なし）
  ui/                   # 再利用UI（shadcn/ui, headless）
  ports/                # 抽象I/F定義群（Storage/Auth/HTTP/Config/...）
  adapters-web/         # Web実装（IDB/OPFS/Fetch/WebAuth）
  adapters-desktop/     # Electron実装（SQLite/fs/IPC/AutoUpdater）
  api-client/           # tRPC/RESTクライアント（isomorphic）
  testkits/             # Contract/E2E用テストユーティリティ

config/                 # eslint, tsconfig, vite, prettier, tailwind 等
scripts/                # CI/リリース/コードジェン用スクリプト
```

### 1.1 パッケージ境界

* `packages/core`: 依存は `ports` の型のみに限定。**外部ライブラリ最小化**。
* `packages/ports`: **interface と types だけ**を公開。実装は一切置かない。
* `packages/adapters-*`: 依存するプラットフォーム固有Libはここに閉じ込める。

---

## 2. Port（抽象インターフェース）定義

実装済み: `packages/ports/`
- config.ts (AppConfig, ConfigPort)
- storage.ts (KV, BlobStore, StoragePort)
- auth.ts (Session, AuthPort)
- http.ts (HttpClient)
- repositories.ts (EvaluationRepository, NotesRepository)
- logger.ts (Logger)
- llm.ts (LLMPort)

---

## 3. 実装順序（Work Order）

### Phase 0: スキャフォールド & 枠組み固定 ✅ DONE
1. ✅ Monorepo構造作成（pnpm-workspace.yaml, turbo.json）
2. ✅ Port定義作成（7つのインターフェース）
3. ✅ 型堅牢化設定（tsconfig strict + eslint no-any）

### Phase 1: Core抽出（Next）
1. `packages/core` に bootstrap と基本ユースケース作成
2. 既存の評価ロジックをPortに依存させて抽出
3. Contract Tests雛形作成

### Phase 2: Webアダプター実装
1. `adapters-web` 実装（IDB, Supabase, Fetch）
2. `apps/web` でbootstrap呼び出し

### Phase 3: Desktopアダプター実装
1. `adapters-desktop` 実装（SQLite, OAuth, IPC）
2. `apps/desktop` でpreload+bootstrap

### Phase 4-6: Tests, Billing, LLM統合

---

## 4. Definition of Done（Phase 0）

* [x] モノレポ構造完成（pnpm-workspace.yaml, packages/）
* [x] Port定義固定（7インターフェース）
* [x] 型堅牢化（tsconfig + eslint）
* [x] turbo.json パイプライン設定
* [ ] 関数レジストリ自動生成スクリプト
* [ ] CLAUDE.md更新

---

**最終更新**: 2025-09-30
**Phase**: 0 (基盤整備)