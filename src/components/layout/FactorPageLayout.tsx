'use client'

import React, { type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Header, Footer } from '@/components/layout'
import { Button } from '@/components/ui'

export interface FactorPageLayoutProps {
  children: ReactNode
  title: string
  breadcrumbLabel: string
  evaluationNo?: string
  creator?: {
    department: string
    name: string
    date: string
  }
  checker?: {
    department: string
    name: string
    date: string
  }
  workInfo?: {
    workName: string
    factoryName: string
    processName: string
  }
  showAiButton?: boolean
  aiButtonText?: string
  onAiClick?: () => void
  customActions?: ReactNode
}

export function FactorPageLayout({
  children,
  title,
  breadcrumbLabel,
  evaluationNo = 'EV-2024-001',
  creator = {
    department: '生産技術企画部',
    name: '山田 太郎',
    date: '2024/08/20'
  },
  checker = {
    department: '生産企画部',
    name: '鈴木 一郎',
    date: '2024/08/21'
  },
  workInfo = {
    workName: 'サンプル作業',
    factoryName: '〇〇工場',
    processName: '△△工程'
  },
  showAiButton = true,
  aiButtonText = 'AIで自動選択する',
  onAiClick,
  customActions
}: FactorPageLayoutProps): React.JSX.Element {
  const router = useRouter()

  const handleBackToMain = () => {
    router.push('/evaluation/new')
  }

  const handleBackToDashboard = () => {
    router.push('/dashboard')
  }

  const handleSave = () => {
    // TODO: Implement save functionality
  }

  return (
    <div className="aspect-container">
      <Header
        variant="standard"
        evaluationNo={evaluationNo}
        creator={creator}
        checker={checker}
        workInfo={workInfo}
      />

      <main className="flex-grow overflow-hidden bg-white dark:bg-gray-900">
        {children}
      </main>

      <Footer
        variant="standard"
        status="unsaved"
        showAiButton={showAiButton}
        aiButtonText={aiButtonText}
        onAiButtonClick={onAiClick}
        actions={
          customActions || (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleBackToMain}
              >
                ← メイン画面
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleBackToDashboard}
              >
                ダッシュボード
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={handleSave}
              >
                保存
              </Button>
            </div>
          )
        }
      />
    </div>
  )
}