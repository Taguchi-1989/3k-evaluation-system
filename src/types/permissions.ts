export type UserRole = 'viewer' | 'editor' | 'checker' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  department: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Permission {
  canView: boolean
  canEdit: boolean
  canCheck: boolean
  canAdmin: boolean
  canExport: boolean
  canImport: boolean
  canManageUsers: boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  viewer: {
    canView: true,
    canEdit: false,
    canCheck: false,
    canAdmin: false,
    canExport: false,
    canImport: false,
    canManageUsers: false,
  },
  editor: {
    canView: true,
    canEdit: true,
    canCheck: false,
    canAdmin: false,
    canExport: true,
    canImport: true,
    canManageUsers: false,
  },
  checker: {
    canView: true,
    canEdit: false,
    canCheck: true,
    canAdmin: false,
    canExport: true,
    canImport: false,
    canManageUsers: false,
  },
  admin: {
    canView: true,
    canEdit: true,
    canCheck: true,
    canAdmin: true,
    canExport: true,
    canImport: true,
    canManageUsers: true,
  },
}

export const ROLE_LABELS: Record<UserRole, string> = {
  viewer: '閲覧者',
  editor: '記入者',
  checker: '確認者',
  admin: 'アドミン',
}

export interface PermissionCheck {
  hasPermission: boolean
  reason?: string
}