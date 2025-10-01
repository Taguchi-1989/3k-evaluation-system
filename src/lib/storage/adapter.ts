/**
 * ストレージアダプター
 * 環境に応じて適切なストレージ実装を返す
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IEvaluationStorage = any;
import { LocalStorage } from './local';
import { ElectronStorage } from './electron';

/**
 * 実行環境がElectronかどうかを判定
 */
export function isElectron(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.electron);
}

/**
 * 環境に応じたストレージインスタンスを取得
 */
export function getStorage(): IEvaluationStorage {
  if (isElectron()) {
    return new ElectronStorage();
  }
  return new LocalStorage();
}

// シングルトンインスタンス
let storageInstance: IEvaluationStorage | null = null;

/**
 * ストレージインスタンスを取得（シングルトン）
 */
export function getStorageInstance(): IEvaluationStorage {
  if (!storageInstance) {
    storageInstance = getStorage();
  }
  return storageInstance;
}