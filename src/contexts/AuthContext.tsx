'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User, UserRole, Permission, PermissionCheck } from '@/types/permissions';
import { ROLE_PERMISSIONS } from '@/types/permissions'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  hasPermission: (action: keyof Permission) => PermissionCheck
  checkPermission: (action: keyof Permission) => boolean
  updateUserRole: (userId: string, newRole: UserRole) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// デモ用のユーザーデータ
const DEMO_USERS: User[] = [
  {
    id: '1',
    name: '田中 太郎',
    email: 'tanaka@example.com',
    department: '製造部',
    role: 'admin',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: '佐藤 花子',
    email: 'sato@example.com',
    department: '品質管理部',
    role: 'checker',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: '山田 次郎',
    email: 'yamada@example.com',
    department: '安全衛生部',
    role: 'editor',
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date()
  },
  {
    id: '4',
    name: '鈴木 一郎',
    email: 'suzuki@example.com',
    department: '総務部',
    role: 'viewer',
    isActive: true,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date()
  }
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // ローカルストレージから保存されたユーザー情報を取得
    const savedUser = localStorage.getItem('auth_user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Failed to parse saved user data:', error)
        localStorage.removeItem('auth_user')
      }
    } else {
      // デモ用：デフォルトでアドミンユーザーでログイン
      const defaultUser = DEMO_USERS[0]
      setUser(defaultUser ?? null)
      setIsAuthenticated(true)
      localStorage.setItem('auth_user', JSON.stringify(defaultUser))
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // デモ用：簡単な認証（実際の実装では適切な認証を行う）
    const foundUser = DEMO_USERS.find(u => u.email === email && u.isActive)
    
    if (foundUser && password === 'demo123') {
      setUser(foundUser)
      setIsAuthenticated(true)
      localStorage.setItem('auth_user', JSON.stringify(foundUser))
      return true
    }
    
    return false
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('auth_user')
  }

  const hasPermission = (action: keyof Permission): PermissionCheck => {
    if (!user || !isAuthenticated) {
      return {
        hasPermission: false,
        reason: '未認証です。ログインしてください。'
      }
    }

    if (!user.isActive) {
      return {
        hasPermission: false,
        reason: 'アカウントが無効になっています。'
      }
    }

    const userPermissions = ROLE_PERMISSIONS[user.role]
    const hasAccess = userPermissions[action]

    if (!hasAccess) {
      return {
        hasPermission: false,
        reason: 'この操作を実行する権限がありません。'
      }
    }

    return { hasPermission: true }
  }

  const checkPermission = (action: keyof Permission): boolean => {
    return hasPermission(action).hasPermission
  }

  const updateUserRole = async (userId: string, newRole: UserRole): Promise<boolean> => {
    if (!checkPermission('canManageUsers')) {
      return false
    }

    // デモ用：実際の実装ではAPIを呼び出す
    const userIndex = DEMO_USERS.findIndex(u => u.id === userId)
    if (userIndex !== -1 && DEMO_USERS[userIndex]) {
      DEMO_USERS[userIndex].role = newRole
      DEMO_USERS[userIndex].updatedAt = new Date()
      
      // 現在のユーザーが更新対象の場合、状態を更新
      if (user && user.id === userId) {
        const updatedUser = { ...user, role: newRole, updatedAt: new Date() }
        setUser(updatedUser)
        localStorage.setItem('auth_user', JSON.stringify(updatedUser))
      }
      
      return true
    }
    
    return false
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      logout,
      hasPermission,
      checkPermission,
      updateUserRole
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { DEMO_USERS }