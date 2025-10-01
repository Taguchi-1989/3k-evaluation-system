'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import type { Permission } from '@/types/permissions'

interface PermissionGuardProps {
  children: React.ReactNode
  requiredPermission: keyof Permission
  fallback?: React.ReactNode
  showMessage?: boolean
}

export function PermissionGuard({
  children,
  requiredPermission,
  fallback,
  showMessage = true
}: PermissionGuardProps): React.JSX.Element | null {
  const { hasPermission } = useAuth()
  const permissionCheck = hasPermission(requiredPermission)

  if (!permissionCheck.hasPermission) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (showMessage) {
      return (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                アクセス権限が不足しています
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                {permissionCheck.reason}
              </p>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  return <>{children}</>
}