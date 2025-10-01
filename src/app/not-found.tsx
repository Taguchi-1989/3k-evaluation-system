'use client'

import React from 'react'
import { Button } from '@/components/ui'
import { Footer } from '@/components/layout/Footer'
import UnifiedHeader from '@/components/layout/UnifiedHeader'
import Link from 'next/link'

export default function NotFound(): React.JSX.Element {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <UnifiedHeader
        title="ページが見つかりません"
        variant="home"
      />

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-gray-400 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              ページが見つかりません
            </h2>
            <p className="text-gray-600">
              お探しのページは存在しないか、移動された可能性があります。
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/">
              <Button variant="primary" size="md" className="w-full">
                ホームに戻る
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="md" className="w-full">
                ダッシュボードへ
              </Button>
            </Link>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>問題が解決しない場合は、システム管理者にお問い合わせください。</p>
          </div>
        </div>
      </main>

      <Footer variant="app" />
    </div>
  )
}