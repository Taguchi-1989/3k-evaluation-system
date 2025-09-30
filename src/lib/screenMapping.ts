/**
 * 画面管理番号マッピングシステム
 * 各ページのパスから画面番号と名称を自動決定
 */

export interface ScreenInfo {
  id: string
  name: string
  category: string
}

export const SCREEN_MAPPING: Record<string, ScreenInfo> = {
  // 1. トップページ関連
  '/': {
    id: '1-1',
    name: 'トップページ',
    category: 'ホーム'
  },
  '/home': {
    id: '1-1',
    name: 'トップページ', 
    category: 'ホーム'
  },
  '/dashboard': {
    id: '1-2',
    name: 'ダッシュボード',
    category: '管理'
  },
  '/settings': {
    id: '1-3',
    name: '設定',
    category: '管理'
  },

  // 2. 新規評価関連
  '/evaluation/new': {
    id: '2-1',
    name: '新規評価',
    category: '評価作成'
  },
  '/evaluation/physical': {
    id: '2-2',
    name: '肉体因子評価',
    category: '評価作成'
  },
  '/evaluation/mental': {
    id: '2-3',
    name: '精神因子評価',
    category: '評価作成'
  },
  '/evaluation/environmental': {
    id: '2-4',
    name: '環境因子評価',
    category: '評価作成'
  },
  '/evaluation/hazard': {
    id: '2-5',
    name: '危険因子評価',
    category: '評価作成'
  },
  '/evaluation/worktime': {
    id: '2-6',
    name: '作業時間評価',
    category: '評価作成'
  },

  // 詳細サブページ
  '/evaluation/mental/stress': {
    id: '2-3a',
    name: 'ストレス詳細評価',
    category: '評価作成'
  },
  '/evaluation/mental/focus': {
    id: '2-3b',
    name: '集中力詳細評価',
    category: '評価作成'
  },
  '/evaluation/physical/posture': {
    id: '2-2a',
    name: '姿勢評価',
    category: '評価作成'
  },
  '/evaluation/physical/posture/matrix': {
    id: '2-2b',
    name: '姿勢マトリクス',
    category: '評価作成'
  },
  '/evaluation/environmental/chemical': {
    id: '2-4a',
    name: '化学物質評価',
    category: '評価作成'
  },

  // 3. 評価管理関連
  '/evaluation/list': {
    id: '3-1',
    name: '評価一覧',
    category: '評価管理'
  },
  '/evaluation/edit': {
    id: '3-2',
    name: '評価編集',
    category: '評価管理'
  }
}

/**
 * パスから画面情報を取得
 */
export function getScreenInfo(pathname: string): ScreenInfo {
  // 完全一致を優先
  if (SCREEN_MAPPING[pathname]) {
    return SCREEN_MAPPING[pathname]
  }

  // 部分一致（動的ルート対応）
  const pathSegments = pathname.split('/')
  
  // 編集ページの場合 (/evaluation/edit/[id])
  if (pathSegments[1] === 'evaluation' && pathSegments[2] === 'edit') {
    return {
      id: '3-2',
      name: '評価編集',
      category: '評価管理'
    }
  }

  // 新規評価の詳細画面
  if (pathSegments[1] === 'evaluation') {
    const subPath = `/${pathSegments.slice(1, 3).join('/')}`
    if (SCREEN_MAPPING[subPath]) {
      return SCREEN_MAPPING[subPath]
    }
  }

  // デフォルト値
  return {
    id: '0-0',
    name: '不明なページ',
    category: 'その他'
  }
}

/**
 * カテゴリ別の色を取得
 */
export function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    'ホーム': 'bg-blue-100 text-blue-800',
    '管理': 'bg-purple-100 text-purple-800',
    '評価作成': 'bg-green-100 text-green-800',
    '評価管理': 'bg-orange-100 text-orange-800',
    'その他': 'bg-gray-100 text-gray-800'
  }
  return colorMap[category] || colorMap['その他']
}

/**
 * パンくずリスト生成
 */
export function generateBreadcrumb(pathname: string): { label: string; path?: string }[] {
  const screenInfo = getScreenInfo(pathname)
  const pathSegments = pathname.split('/').filter(Boolean)

  const breadcrumb: { label: string; path?: string }[] = [
    { label: 'ホーム', path: '/' }
  ]

  if (pathSegments.length > 0) {
    if (pathSegments[0] === 'evaluation') {
      breadcrumb.push({ label: '評価', path: '/evaluation/new' })
      
      if (pathSegments[1] && pathSegments[1] !== 'new') {
        const subScreenInfo = getScreenInfo(`/evaluation/${pathSegments[1]}`)
        breadcrumb.push({ 
          label: subScreenInfo.name, 
          path: pathSegments.length > 2 ? `/evaluation/${pathSegments[1]}` : undefined 
        })
      }
      
      if (pathSegments.length > 2) {
        breadcrumb.push({ label: screenInfo.name })
      }
    } else if (pathSegments[0] === 'dashboard') {
      breadcrumb.push({ label: 'ダッシュボード' })
    } else if (pathSegments[0] === 'settings') {
      breadcrumb.push({ label: '設定' })
    } else {
      breadcrumb.push({ label: screenInfo.name })
    }
  }

  return breadcrumb
}