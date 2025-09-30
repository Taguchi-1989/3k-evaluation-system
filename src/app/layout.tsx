import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PerformanceProvider } from "@/components/optimized/PerformanceProvider";
import { ElectronTitleBar, ElectronStatusBar } from "@/components/electron/ElectronTitleBar";
import { AppBootstrap } from "@/components/providers/AppBootstrap";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: "3K評価システム - 作業環境評価アプリケーション",
  description: "3K指数（肉体因・精神因・環境因・危険因）を総合的に評価する作業環境評価システム",
  keywords: "3K評価, 作業環境, RULA, OWAS, 安全管理, 労働衛生",
  authors: [{ name: "3K評価システム開発チーム" }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  openGraph: {
    title: "3K評価システム",
    description: "作業環境の総合評価システム",
    locale: "ja_JP",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "Content-Language": "ja",
    "X-UA-Compatible": "IE=edge",
    "format-detection": "telephone=no",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="content-language" content="ja" />
        <meta name="language" content="Japanese" />
        <meta name="google" content="notranslate" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        lang="ja"
      >
        <ErrorBoundary>
          <PerformanceProvider>
            <AppBootstrap>
              <ThemeProvider>
                <AuthProvider>
                  <ElectronTitleBar />
                  <div className="flex-1 overflow-hidden">
                    {children}
                  </div>
                  <ElectronStatusBar />
                </AuthProvider>
              </ThemeProvider>
            </AppBootstrap>
          </PerformanceProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
