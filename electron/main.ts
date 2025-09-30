/**
 * Electronメインプロセス
 * 3K評価システム デスクトップ版
 */

import { app, BrowserWindow, ipcMain, type IpcMainInvokeEvent } from 'electron'
import * as path from 'path'
import Store from 'electron-store'

// 開発モードの判定関数
function isDevelopment(): boolean {
  return process.env.NODE_ENV !== 'production' && !app.isPackaged
}

// electron-storeの初期化
const store = new Store()

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      // セキュリティのためnodeIntegration無効化
      nodeIntegration: false,
      // コンテキスト分離を有効化
      contextIsolation: true,
      // preloadスクリプトの指定
      preload: path.join(__dirname, 'preload/preload.js'),
    },
    // アプリアイコン
    icon: path.join(__dirname, '../../public/icons/icon.png'),
  });

  // 開発モードとプロダクションモードで読み込むURLを切り替え
  if (isDevelopment()) {
    // 開発モード: Next.js devサーバーに接続
    mainWindow.loadURL('http://localhost:3000');
    // DevToolsを開く
    mainWindow.webContents.openDevTools();
  } else {
    // プロダクションモード: ビルド済みファイルを読み込み
    mainWindow.loadFile(path.join(__dirname, '../../out/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Electronアプリの準備完了
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // macOS: Dockアイコンクリック時にウィンドウがなければ作成
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 全ウィンドウが閉じられた時
app.on('window-all-closed', () => {
  // macOS以外: アプリを終了
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ========================================
// IPC通信ハンドラー（electron-store）
// ========================================

// ストアから値を取得
ipcMain.handle('store:get', async (_event: IpcMainInvokeEvent, key: string) => {
  return store.get(key)
})

// ストアに値を保存
ipcMain.handle('store:set', async (_event: IpcMainInvokeEvent, key: string, value: unknown) => {
  store.set(key, value)
  return true
})

// ストアから値を削除
ipcMain.handle('store:delete', async (_event: IpcMainInvokeEvent, key: string) => {
  store.delete(key)
  return true
})

// ストアをクリア
ipcMain.handle('store:clear', async () => {
  store.clear();
  return true;
});

// ストアのパスを取得
ipcMain.handle('store:path', async () => {
  return store.path;
});

console.log('3K評価システム - Electron版起動');
console.log('ストレージパス:', store.path);