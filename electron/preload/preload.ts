/**
 * Electronプリロードスクリプト
 * レンダラープロセスに安全なAPIを公開
 */

import { contextBridge, ipcRenderer } from 'electron';

// レンダラープロセスに公開するAPI
contextBridge.exposeInMainWorld('electron', {
  // electron-store API
  store: {
    get: (key: string) => ipcRenderer.invoke('store:get', key),
    set: (key: string, value: unknown) => ipcRenderer.invoke('store:set', key, value),
    delete: (key: string) => ipcRenderer.invoke('store:delete', key),
    clear: () => ipcRenderer.invoke('store:clear'),
    path: () => ipcRenderer.invoke('store:path'),
  },

  // 環境情報
  platform: process.platform,
  isElectron: true,
});