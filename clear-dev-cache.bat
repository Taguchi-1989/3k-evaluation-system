@echo off
echo ============================================
echo  アクセシビリティ修正 - 開発環境完全リセット
echo ============================================
echo.

echo [1/5] Node.jsプロセスを停止中...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Node.jsプロセスを停止しました
) else (
    echo - Node.jsプロセスは実行されていません
)
echo.

echo [2/5] Next.jsキャッシュを削除中...
if exist .next (
    rmdir /S /Q .next
    echo ✓ .nextディレクトリを削除しました
) else (
    echo - .nextディレクトリは存在しません
)
echo.

echo [3/5] node_modules/.cacheを削除中...
if exist node_modules\.cache (
    rmdir /S /Q node_modules\.cache
    echo ✓ node_modules\.cacheを削除しました
) else (
    echo - node_modules\.cacheは存在しません
)
echo.

echo [4/5] Turboキャッシュを削除中...
if exist .turbo (
    rmdir /S /Q .turbo
    echo ✓ .turboディレクトリを削除しました
) else (
    echo - .turboディレクトリは存在しません
)
echo.

echo [5/5] 開発サーバーを起動中...
echo.
echo ============================================
echo  キャッシュクリア完了！
echo ============================================
echo.
echo 次の手順を実施してください:
echo.
echo 1. ブラウザでハードリロード
echo    Windows: Ctrl + Shift + R
echo    または: Ctrl + F5
echo.
echo 2. Edge DevToolsを開く (F12)
echo.
echo 3. 設定 (⚙️) を開く
echo.
echo 4. "キャッシュを無効にする" をONにする
echo.
echo 5. ページをリロード
echo.
echo ============================================
echo.

npm run dev
