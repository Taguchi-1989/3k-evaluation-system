import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '3K評価システム',
  description: '労働環境における3K指数評価アプリケーション',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}