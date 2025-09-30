'use client'

import { useState } from 'react'
import { useAuth, DEMO_USERS } from '@/contexts/AuthContext'
import { PermissionGuard } from '@/components/auth/PermissionGuard'
import { UserRoleIndicator } from '@/components/auth/UserRoleIndicator'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { User, UserRole, ROLE_LABELS } from '@/types/permissions'
import { Header } from '@/components/layout/Header'

export default function AdminPage() {
  const { user, updateUserRole } = useAuth()
  const [users, setUsers] = useState<User[]>(DEMO_USERS)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [newRole, setNewRole] = useState<UserRole>('viewer')

  const handleRoleUpdate = async (userId: string) => {
    const success = await updateUserRole(userId, newRole)
    if (success) {
      // ローカル状態を更新
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, role: newRole, updatedAt: new Date() } : u))
      )
      setEditingUser(null)
    }
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'text-red-600 dark:text-red-400'
      case 'checker':
        return 'text-blue-600 dark:text-blue-400'
      case 'editor':
        return 'text-green-600 dark:text-green-400'
      case 'viewer':
        return 'text-gray-600 dark:text-gray-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header variant="app" title="管理者ページ" />

      <div className="container mx-auto px-4 py-8">
        <PermissionGuard requiredPermission="canManageUsers">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ユーザー管理
              </h1>
              <UserRoleIndicator variant="full" />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>ユーザー一覧と権限管理</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">
                          ユーザー情報
                        </th>
                        <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">
                          部署
                        </th>
                        <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">
                          権限
                        </th>
                        <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">
                          ステータス
                        </th>
                        <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(userItem => (
                        <tr
                          key={userItem.id}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="p-3">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {userItem.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {userItem.email}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-gray-700 dark:text-gray-300">
                            {userItem.department}
                          </td>
                          <td className="p-3">
                            {editingUser === userItem.id ? (
                              <select
                                value={newRole}
                                onChange={e => setNewRole(e.target.value as UserRole)}
                                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              >
                                {Object.entries(ROLE_LABELS).map(([role, label]) => (
                                  <option key={role} value={role}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className={`font-medium ${getRoleColor(userItem.role)}`}>
                                {ROLE_LABELS[userItem.role]}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                userItem.isActive
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              }`}
                            >
                              {userItem.isActive ? 'アクティブ' : '無効'}
                            </span>
                          </td>
                          <td className="p-3">
                            {editingUser === userItem.id ? (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleRoleUpdate(userItem.id)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  保存
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingUser(null)
                                    setNewRole(userItem.role)
                                  }}
                                >
                                  キャンセル
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingUser(userItem.id)
                                  setNewRole(userItem.role)
                                }}
                                disabled={userItem.id === user?.id}
                              >
                                編集
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>権限設定の説明</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">権限レベル</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">閲覧者</span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">評価結果の閲覧のみ可能</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        <div>
                          <span className="font-medium text-green-700 dark:text-green-300">記録者</span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">評価の作成・編集とエクスポートが可能</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                        <div>
                          <span className="font-medium text-blue-700 dark:text-blue-300">確認者</span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">評価の確認・承認とエクスポートが可能</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        <div>
                          <span className="font-medium text-red-700 dark:text-red-300">アドミン</span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">全ての操作とユーザー管理が可能</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">操作権限一覧</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div>・閲覧: 全権限で可能</div>
                      <div>・編集: 記録者とアドミンのみ</div>
                      <div>・確認: 確認者とアドミンのみ</div>
                      <div>・エクスポート: 記録者・確認者・アドミン</div>
                      <div>・インポート: 記録者とアドミンのみ</div>
                      <div>・ユーザー管理: アドミンのみ</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </PermissionGuard>
      </div>
    </div>
  )
}
