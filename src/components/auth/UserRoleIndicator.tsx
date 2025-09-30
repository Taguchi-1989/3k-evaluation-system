'use client'

import { useAuth } from '@/contexts/AuthContext'
import { ROLE_LABELS } from '@/types/permissions'

interface UserRoleIndicatorProps {
  variant?: 'badge' | 'text' | 'full'
  className?: string
}

export function UserRoleIndicator({
  variant = 'badge',
  className = ''
}: UserRoleIndicatorProps) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return null
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'checker':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'editor':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  if (variant === 'text') {
    return (
      <span className={`text-sm text-gray-600 dark:text-gray-400 ${className}`}>
        {ROLE_LABELS[user.role]}
      </span>
    )
  }

  if (variant === 'full') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">権限:</span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
            {ROLE_LABELS[user.role]}
          </span>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {user.name} ({user.department})
        </span>
      </div>
    )
  }

  // デフォルト: badge
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)} ${className}`}>
      {ROLE_LABELS[user.role]}
    </span>
  )
}