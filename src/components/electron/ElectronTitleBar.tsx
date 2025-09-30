'use client'

/**
 * Electronカスタムタイトルバー
 * ネイティブ感のあるUIを提供
 */

import React, { useState, useEffect } from 'react';
import { isElectron, electronApp, electronSystem } from '@/lib/electron/electronAPI';

interface ElectronTitleBarProps {
  title?: string;
  showWindowControls?: boolean;
  className?: string;
}

export const ElectronTitleBar: React.FC<ElectronTitleBarProps> = ({
  title = '3K評価システム',
  showWindowControls = true,
  className = ''
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [platform, setPlatform] = useState('');

  useEffect(() => {
    if (isElectron()) {
      electronSystem.getPlatform().then(setPlatform);
    }
  }, []);

  // Electron環境でない場合は何も表示しない
  if (!isElectron()) {
    return null;
  }

  const handleMinimize = () => {
    electronApp.minimize();
  };

  const handleMaximize = () => {
    electronApp.maximize();
    setIsMaximized(!isMaximized);
  };

  const handleClose = () => {
    electronApp.quit();
  };

  // macOSかどうか判定
  const isMac = platform === 'darwin';

  return (
    <div
      className={`
        electron-titlebar
        flex items-center justify-between
        h-8 bg-gray-100 border-b border-gray-200
        select-none
        ${isMac ? 'pl-20' : 'pl-3'} // macOSでは左側に余白（トラフィックライト用）
        ${className}
      `}
      style={{
        WebkitAppRegion: 'drag', // ドラッグ可能領域
      } as React.CSSProperties}
    >
      {/* アプリタイトル */}
      <div className="flex-1 flex items-center justify-center">
        <span className="text-sm text-gray-700 font-medium">
          {title}
        </span>
      </div>

      {/* ウィンドウコントロール（Windows/Linux） */}
      {showWindowControls && !isMac && (
        <div className="flex items-center">
          {/* 最小化ボタン */}
          <button
            onClick={handleMinimize}
            className="
              w-12 h-8 flex items-center justify-center
              hover:bg-gray-200 transition-colors
              focus:outline-none
            "
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            title="最小化"
          >
            <svg width="10" height="1" viewBox="0 0 10 1" className="fill-gray-600">
              <rect width="10" height="1" />
            </svg>
          </button>

          {/* 最大化/復元ボタン */}
          <button
            onClick={handleMaximize}
            className="
              w-12 h-8 flex items-center justify-center
              hover:bg-gray-200 transition-colors
              focus:outline-none
            "
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            title={isMaximized ? '復元' : '最大化'}
          >
            {isMaximized ? (
              // 復元アイコン
              <svg width="10" height="10" viewBox="0 0 10 10" className="fill-gray-600">
                <path d="M2,0 L8,0 L8,6 L6,6 L6,8 L0,8 L0,2 L2,2 L2,0 Z M1,3 L1,7 L5,7 L5,6 L2,6 L2,3 L1,3 Z M3,1 L3,5 L7,5 L7,1 L3,1 Z" />
              </svg>
            ) : (
              // 最大化アイコン
              <svg width="10" height="10" viewBox="0 0 10 10" className="fill-gray-600">
                <path d="M0,0 L0,10 L10,10 L10,0 L0,0 Z M1,1 L9,1 L9,9 L1,9 L1,1 Z" />
              </svg>
            )}
          </button>

          {/* 閉じるボタン */}
          <button
            onClick={handleClose}
            className="
              w-12 h-8 flex items-center justify-center
              hover:bg-red-500 hover:text-white transition-colors
              focus:outline-none
            "
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            title="閉じる"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" className="fill-current">
              <path d="M0.5,0.5 L9.5,9.5 M9.5,0.5 L0.5,9.5" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Electronメニューバーコンポーネント
 */
export const ElectronMenuBar: React.FC<{
  onMenuClick?: (action: string) => void;
}> = ({ onMenuClick }) => {
  if (!isElectron()) {
    return null;
  }

  const handleMenuClick = (action: string) => {
    onMenuClick?.(action);
  };

  return (
    <div
      className="
        electron-menubar
        flex items-center
        h-6 bg-gray-50 border-b border-gray-200
        text-xs
        select-none
      "
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* ファイルメニュー */}
      <div className="relative group">
        <button
          className="
            px-2 py-1 hover:bg-gray-200 rounded-sm
            focus:outline-none
          "
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          onClick={() => handleMenuClick('file')}
        >
          ファイル
        </button>
      </div>

      {/* 編集メニュー */}
      <div className="relative group">
        <button
          className="
            px-2 py-1 hover:bg-gray-200 rounded-sm
            focus:outline-none
          "
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          onClick={() => handleMenuClick('edit')}
        >
          編集
        </button>
      </div>

      {/* 表示メニュー */}
      <div className="relative group">
        <button
          className="
            px-2 py-1 hover:bg-gray-200 rounded-sm
            focus:outline-none
          "
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          onClick={() => handleMenuClick('view')}
        >
          表示
        </button>
      </div>

      {/* ヘルプメニュー */}
      <div className="relative group">
        <button
          className="
            px-2 py-1 hover:bg-gray-200 rounded-sm
            focus:outline-none
          "
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          onClick={() => handleMenuClick('help')}
        >
          ヘルプ
        </button>
      </div>
    </div>
  );
};

/**
 * Electronステータスバーコンポーネント
 */
export const ElectronStatusBar: React.FC = () => {
  const [version, setVersion] = useState('');
  const [platform, setPlatform] = useState('');

  useEffect(() => {
    if (isElectron()) {
      electronSystem.getVersion().then(setVersion);
      electronSystem.getPlatform().then(setPlatform);
    }
  }, []);

  if (!isElectron()) {
    return null;
  }

  return (
    <div className="
      electron-statusbar
      flex items-center justify-between
      h-6 bg-gray-100 border-t border-gray-200
      px-2 text-xs text-gray-600
      select-none
    ">
      <div className="flex items-center space-x-4">
        <span>Ready</span>
      </div>
      <div className="flex items-center space-x-4">
        <span>v{version}</span>
        <span className="capitalize">{platform}</span>
      </div>
    </div>
  );
};

export default ElectronTitleBar;