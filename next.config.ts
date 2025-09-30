import type { NextConfig } from "next";

// Electron版ビルドかどうかを判定
const isElectronBuild = process.env.ELECTRON_BUILD === 'true';

const nextConfig: NextConfig = {
  // Electron版は静的エクスポート、Web版は通常ビルド
  output: isElectronBuild ? 'export' : undefined,

  // 画像最適化（Electron版では無効化）
  images: {
    unoptimized: isElectronBuild,
  },

  // 環境変数をクライアントに公開
  env: {
    NEXT_PUBLIC_IS_ELECTRON: isElectronBuild ? 'true' : 'false',
  },

  // Vercelビルド時の最適化
  ...((!isElectronBuild) && {
    // Web版のみの設定
    reactStrictMode: true,
  }),
};

export default nextConfig;