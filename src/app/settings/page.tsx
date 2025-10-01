'use client'

import React, { useState } from 'react'
import { Header } from '@/components/layout'
import { Card, CardContent, Button, Input, ThemeToggle } from '@/components/ui'

export default function SettingsPage(): React.JSX.Element {
  const [formData, setFormData] = useState({
    userName: '',
    department: '',
    email: '',
    notifications: true,
    autoSave: true,
    language: 'ja'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = () => {
    // 設定を保存する処理（実装は仮）
    // TODO: Implement actual save functionality with database
    alert('設定を保存しました')
  }

  const handleReset = () => {
    setFormData({
      userName: '',
      department: '',
      email: '',
      notifications: true,
      autoSave: true,
      language: 'ja'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        variant="app"
        title="設定 - 3K指数評価システム"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
          >
            戻る
          </Button>
        }
      />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            システム設定
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            アプリケーションの動作やユーザー設定を変更できます。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ユーザー情報設定 */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                ユーザー情報
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    氏名
                  </label>
                  <Input
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    placeholder="山田 太郎"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    部署名
                  </label>
                  <Input
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="生産技術企画部"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    メールアドレス
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="user@example.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ログイン・権限設定 */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                ログイン・権限設定
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    権限レベル
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    現在の権限: <strong>評価者</strong>
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    権限の変更にはシステム管理者にお問い合わせください
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ログイン方法
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled
                  >
                    <option>社内認証システム</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    現在は社内認証システムのみ利用可能です
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* アプリケーション設定 */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                アプリケーション設定
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      通知設定
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      評価完了時などの通知を受け取る
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="notifications"
                    checked={formData.notifications}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      自動保存
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      評価データを自動的に保存する
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="autoSave"
                    checked={formData.autoSave}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    言語設定
                  </label>
                  <select 
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="ja">日本語</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* テーマ設定 */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                表示設定
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      テーマ
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ライト・ダークモードの切り替え
                    </p>
                  </div>
                  <ThemeToggle variant="switch" size="md" />
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    画面表示について
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    推奨解像度: 1920×1080以上<br />
                    推奨ブラウザ: Chrome, Firefox, Safari, Edge
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 保存ボタン */}
        <div className="mt-8 flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={handleReset}
          >
            リセット
          </Button>
          <Button
            onClick={handleSave}
          >
            設定を保存
          </Button>
        </div>

        {/* システム情報 */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center text-gray-500 dark:text-gray-400 space-y-2">
            <p className="text-sm font-medium">システム情報</p>
            <p className="text-xs">3K指数評価システム ver.1.0.0</p>
            <p className="text-xs">最終更新: 2025年8月21日</p>
          </div>
        </div>
      </main>
    </div>
  )
}