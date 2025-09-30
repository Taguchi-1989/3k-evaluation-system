/**
 * Electron API統合層
 * Next.js (Renderer Process) からElectron APIへの安全なアクセス
 */

// Electron環境判定
export const isElectron = (): boolean => {
  return typeof window !== 'undefined' &&
         typeof window.electronAPI !== 'undefined' &&
         window.electronAPI.isElectron === true;
};

// Electronの開発環境判定
export const isElectronDev = (): boolean => {
  return isElectron() && window.electronAPI.isDevelopment === true;
};

/**
 * データベース操作API
 */
export const electronDB = {
  /**
   * SQLクエリ実行
   */
  query: async (sql: string, params: any[] = []) => {
    if (!isElectron()) {
      throw new Error('Electron環境でのみ利用可能です');
    }
    return await window.electronAPI.database.query(sql, params);
  },

  /**
   * トランザクション実行
   */
  transaction: async (queries: Array<{query: string, params: any[]}>) => {
    if (!isElectron()) {
      throw new Error('Electron環境でのみ利用可能です');
    }
    return await window.electronAPI.database.transaction(queries);
  }
};

/**
 * 評価データ操作API
 */
export const electronEvaluation = {
  /**
   * 評価データ保存
   */
  save: async (data: any) => {
    if (!isElectron()) {
      throw new Error('Electron環境でのみ利用可能です');
    }
    return await window.electronAPI.evaluation.save(data);
  },

  /**
   * 評価データ読み込み
   */
  load: async (id: string) => {
    if (!isElectron()) {
      throw new Error('Electron環境でのみ利用可能です');
    }
    return await window.electronAPI.evaluation.load(id);
  },

  /**
   * 評価データ一覧取得
   */
  list: async (filters?: any) => {
    if (!isElectron()) {
      throw new Error('Electron環境でのみ利用可能です');
    }
    return await window.electronAPI.evaluation.list(filters);
  },

  /**
   * 評価データ削除
   */
  delete: async (id: string) => {
    if (!isElectron()) {
      throw new Error('Electron環境でのみ利用可能です');
    }
    return await window.electronAPI.evaluation.delete(id);
  }
};

/**
 * ファイル操作API
 */
export const electronFile = {
  /**
   * ファイル保存ダイアログ
   */
  saveDialog: async (options: any) => {
    if (!isElectron()) {
      throw new Error('Electron環境でのみ利用可能です');
    }
    return await window.electronAPI.file.saveDialog(options);
  },

  /**
   * ファイル選択ダイアログ
   */
  openDialog: async (options: any) => {
    if (!isElectron()) {
      throw new Error('Electron環境でのみ利用可能です');
    }
    return await window.electronAPI.file.openDialog(options);
  }
};

/**
 * システム情報API
 */
export const electronSystem = {
  /**
   * アプリバージョン取得
   */
  getVersion: async (): Promise<string> => {
    if (!isElectron()) {
      return '0.0.0'; // Web版の場合は固定値
    }
    return await window.electronAPI.system.getVersion();
  },

  /**
   * プラットフォーム取得
   */
  getPlatform: async (): Promise<string> => {
    if (!isElectron()) {
      return 'web'; // Web版の場合
    }
    return await window.electronAPI.system.getPlatform();
  },

  /**
   * 外部リンクを開く
   */
  openExternal: async (url: string) => {
    if (!isElectron()) {
      // Web版の場合は通常のwindow.open
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    return await window.electronAPI.system.openExternal(url);
  }
};

/**
 * アプリケーション制御API
 */
export const electronApp = {
  /**
   * アプリケーション終了
   */
  quit: async () => {
    if (!isElectron()) {
      // Web版の場合は何もしない
      return;
    }
    return await window.electronAPI.app.quit();
  },

  /**
   * ウィンドウ最小化
   */
  minimize: async () => {
    if (!isElectron()) {
      return;
    }
    return await window.electronAPI.app.minimize();
  },

  /**
   * ウィンドウ最大化/復元
   */
  maximize: async () => {
    if (!isElectron()) {
      return;
    }
    return await window.electronAPI.app.maximize();
  }
};

/**
 * プラットフォーム判定ユーティリティ
 */
export const platform = {
  isElectron: isElectron(),
  isElectronDev: isElectronDev(),
  isWeb: !isElectron(),
  isMac: typeof window !== 'undefined' && navigator.platform.includes('Mac'),
  isWindows: typeof window !== 'undefined' && navigator.platform.includes('Win'),
  isLinux: typeof window !== 'undefined' && navigator.platform.includes('Linux'),
};

/**
 * 統合データストレージ
 * ElectronとWebで共通のインターフェース
 */
export const universalStorage = {
  /**
   * データ保存
   */
  save: async (key: string, data: any) => {
    if (isElectron()) {
      // Electron: SQLiteに保存
      return await electronDB.query(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        [key, JSON.stringify(data)]
      );
    } else {
      // Web: LocalStorageに保存
      localStorage.setItem(key, JSON.stringify(data));
      return { success: true };
    }
  },

  /**
   * データ読み込み
   */
  load: async (key: string) => {
    if (isElectron()) {
      // Electron: SQLiteから読み込み
      const result = await electronDB.query(
        'SELECT value FROM settings WHERE key = ?',
        [key]
      );
      if (result.success && result.data && result.data.length > 0) {
        return JSON.parse(result.data[0].value);
      }
      return null;
    } else {
      // Web: LocalStorageから読み込み
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }
  },

  /**
   * データ削除
   */
  remove: async (key: string) => {
    if (isElectron()) {
      // Electron: SQLiteから削除
      return await electronDB.query(
        'DELETE FROM settings WHERE key = ?',
        [key]
      );
    } else {
      // Web: LocalStorageから削除
      localStorage.removeItem(key);
      return { success: true };
    }
  }
};

/**
 * 統合評価データストレージ
 */
export const universalEvaluationStorage = {
  /**
   * 評価データ保存
   */
  save: async (evaluation: any) => {
    if (isElectron()) {
      return await electronEvaluation.save(evaluation);
    } else {
      // Web版: IndexedDBまたはローカルストレージに保存
      const key = `evaluation_${evaluation.id}`;
      return await universalStorage.save(key, evaluation);
    }
  },

  /**
   * 評価データ読み込み
   */
  load: async (id: string) => {
    if (isElectron()) {
      return await electronEvaluation.load(id);
    } else {
      // Web版: ローカルストレージから読み込み
      const key = `evaluation_${id}`;
      const data = await universalStorage.load(key);
      return { success: !!data, data };
    }
  },

  /**
   * 評価データ一覧取得
   */
  list: async (filters?: any) => {
    if (isElectron()) {
      return await electronEvaluation.list(filters);
    } else {
      // Web版: ローカルストレージから一覧取得
      const keys = Object.keys(localStorage).filter(key => key.startsWith('evaluation_'));
      const evaluations = keys.map(key => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }).filter(Boolean);

      return { success: true, data: evaluations };
    }
  },

  /**
   * 評価データ削除
   */
  delete: async (id: string) => {
    if (isElectron()) {
      return await electronEvaluation.delete(id);
    } else {
      // Web版: ローカルストレージから削除
      const key = `evaluation_${id}`;
      return await universalStorage.remove(key);
    }
  }
};

export default {
  isElectron,
  isElectronDev,
  platform,
  db: electronDB,
  evaluation: electronEvaluation,
  file: electronFile,
  system: electronSystem,
  app: electronApp,
  storage: universalStorage,
  evaluationStorage: universalEvaluationStorage
};