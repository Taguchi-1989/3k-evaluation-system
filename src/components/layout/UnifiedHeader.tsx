'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

interface UnifiedHeaderProps {
  title: string
  score?: string | number
  showLogo?: boolean
  variant?: 'home' | 'evaluation' | 'dashboard'
}

const ScoreBadge = ({ score }: { score: string | number }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
        {score}
      </div>
    </div>
  )
}

export default function UnifiedHeader({
  title,
  score,
  showLogo = true,
  variant = 'evaluation'
}: UnifiedHeaderProps) {
  const pathname = usePathname()

  const getHeaderStyles = () => {
    switch (variant) {
      case 'home':
        return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
      case 'dashboard':
        return 'bg-white border-b border-gray-200 text-gray-900'
      case 'evaluation':
      default:
        return 'bg-white border-b border-gray-200 text-gray-900'
    }
  }

  return (
    <div className={`sticky top-0 z-50 ${getHeaderStyles()}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Title */}
          <div className="flex items-center space-x-4">
            {showLogo && (
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">3K</span>
                </div>
                <span className={`font-semibold ${variant === 'home' ? 'text-white' : 'text-gray-900'}`}>
                  3K指数評価アプリ
                </span>
              </Link>
            )}

            <div className="flex items-center space-x-2">
              {score && <ScoreBadge score={score} />}
              <h1 className={`text-xl font-semibold ${
                variant === 'home' ? 'text-white' : 'text-gray-900'
              }`}>
                {title}
              </h1>
            </div>
          </div>

          {/* Right side - Navigation */}
          <div className="flex items-center space-x-4">
            {variant !== 'home' && (
              <>
                <Link
                  href="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-opacity-80 transition-colors ${
                    pathname === '/'
                      ? 'bg-blue-100 text-blue-700'
                      : (variant as string) === 'home'
                        ? 'text-blue-100 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ホーム
                </Link>
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-opacity-80 transition-colors ${
                    pathname === '/dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : (variant as string) === 'home'
                        ? 'text-blue-100 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ダッシュボード
                </Link>
                <div className={`px-3 py-2 text-sm ${
                  (variant as string) === 'home' ? 'text-blue-200' : 'text-gray-400'
                }`}>
                  ログアウト
                </div>
              </>
            )}

            {variant === 'home' && (
              <div className="flex items-center space-x-2 text-blue-200 text-sm">
                <span>バージョン 1.0.0</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}