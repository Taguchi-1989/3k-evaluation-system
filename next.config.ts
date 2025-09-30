import type { NextConfig } from "next";

// Electron版ビルドかどうかを判定
const isElectronBuild = process.env.ELECTRON_BUILD === 'true';

const nextConfig: NextConfig = {
  // Electron版は静的エクスポート、Web版は通常ビルド
  output: isElectronBuild ? 'export' : undefined,

  // 画像最適化（Electron版では無効化）
  images: {
    unoptimized: isElectronBuild,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
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

  // Monorepo packages をトランスパイル
  transpilePackages: ['@3k/core', '@3k/adapters-web', '@3k/ports'],

  // Webpack設定
  webpack: (config, { isServer }) => {
    // Electronパッケージをブラウザから除外
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'electron': false,
        'electron-log': false,
        'electron-store': false,
        'better-sqlite3': false,
      };
    }

    // Electronアダプターはブラウザから除外
    config.externals = [...(config.externals || []), {
      '@3k/adapters-electron': '@3k/adapters-electron',
      'electron': 'electron',
      'electron-log': 'electron-log',
      'electron-store': 'electron-store',
      'better-sqlite3': 'better-sqlite3',
    }];

    return config;
  },
};

export default nextConfig;