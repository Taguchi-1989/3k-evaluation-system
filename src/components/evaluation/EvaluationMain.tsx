'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout'
import { PhotoViewer, FactorList, SummaryPanel, type FactorItem } from '@/components/evaluation'
import { Button } from '@/components/ui'
import { DocumentViewer } from '@/components/ui/DocumentViewer'
import { useDatabase } from '@/hooks/useDatabase'
import { useEvaluationStore } from '@/hooks/useEvaluationStore'

export interface EvaluationMainProps {
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
  photos?: string[]
  factors?: FactorItem[]
}

export function EvaluationMain({
  evaluationNo,
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
  photos,
  factors
}: EvaluationMainProps): React.JSX.Element {
  const [remarks, setRemarks] = useState('')
  const [, setSelectedPhoto] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const router = useRouter()
  const database = useDatabase()
  const evaluationStore = useEvaluationStore()

  // Zustandストアからデータを取得
  const { evaluationForm, updateEvaluationForm } = evaluationStore

  // workInfoをZustandに同期
  useEffect(() => {
    updateEvaluationForm({
      workName: workInfo.workName,
      factoryName: workInfo.factoryName,
      processName: workInfo.processName,
      remarks
    })
  }, [workInfo.workName, workInfo.factoryName, workInfo.processName, remarks]) // updateEvaluationFormを依存配列から削除

  const handleFileUpload = (files: File[]) => {
    // ファイルアップロード処理
    // TODO: Process uploaded files
  }

  const handleAttachmentCheck = () => {
    // 添付ファイル確認処理
    // TODO: Implement attachments validation
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage('')

    try {
      const evaluationId = await database.saveEvaluation(evaluationForm)

      if (evaluationId) {
        setSaveMessage('保存が完了しました')

        // 保存成功時、ダッシュボードに遷移
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        setSaveMessage('保存に失敗しました')
      }
    } catch (error) {
      console.error('保存エラー:', error)
      setSaveMessage('保存中にエラーが発生しました')
    } finally {
      setIsSaving(false)

      // メッセージを3秒後にクリア
      setTimeout(() => {
        setSaveMessage('')
      }, 3000)
    }
  }

  const handleFactorDetail = (factorType: string) => {
    switch (factorType) {
      case 'physical':
        window.location.href = '/evaluation/physical'
        break
      case 'mental':
        window.location.href = '/evaluation/mental'
        break
      case 'environmental':
        window.location.href = '/evaluation/environmental'
        break
      case 'hazard':
        window.location.href = '/evaluation/hazard'
        break
      case 'worktime':
        window.location.href = '/evaluation/worktime'
        break
      default:
        // Unknown factor type
    }
  }

  const statusBadges = [
    { label: '未記入あり', color: 'gray' as const },
    { label: 'エイヤ記入部', color: 'lime' as const },
    { label: '記入完了', color: 'green' as const },
    { label: '確認完了', color: 'blue' as const }
  ]

  // 因子データにonDetailClickハンドラーを追加
  const factorsWithHandlers = [
    { id: 'physical', name: '肉体因', score: 4, colorScheme: 'green' as const, onDetailClick: () => handleFactorDetail('physical') },
    { id: 'mental', name: '精神因', score: 2, colorScheme: 'green' as const, onDetailClick: () => handleFactorDetail('mental') },
    { id: 'environmental', name: '環境因', score: 1, colorScheme: 'lime' as const, onDetailClick: () => handleFactorDetail('environmental') },
    { id: 'hazard', name: '危険因', score: '-', colorScheme: 'gray' as const, onDetailClick: () => handleFactorDetail('hazard') },
    { id: 'worktime', name: '作業時間', score: 'd', colorScheme: 'blue' as const, onDetailClick: () => handleFactorDetail('worktime') }
  ]

  return (
    <div className="aspect-container">
      <Header
        variant="standard"
        evaluationNo={evaluationNo}
        creator={creator}
        checker={checker}
        workInfo={workInfo}
      />

      <section className="flex-grow p-3 flex flex-col gap-3 overflow-hidden bg-white dark:bg-gray-900">
        {/* 上段：写真と因子リスト */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1 min-h-0">
          <PhotoViewer
            thumbnails={photos}
            onPhotoSelect={setSelectedPhoto}
          />
          
          <FactorList 
            factors={factors || factorsWithHandlers}
          />
        </div>
        
        {/* 下段：資料閲覧とサマリー */}
        <div className="flex flex-col lg:flex-row gap-3 flex-1 min-h-0">
          <DocumentViewer
            documents={[
              {
                id: '1',
                name: '作業手順書.pdf',
                type: 'application/pdf',
                url: '/sample-document.pdf',
                size: 1024000
              },
              {
                id: '2',
                name: '安全マニュアル.pdf',
                type: 'application/pdf',
                url: '/safety-manual.pdf',
                size: 2048000
              }
            ]}
            onFileUpload={handleFileUpload}
            className="flex-1"
          />
          
          <SummaryPanel
            remarks={remarks}
            onRemarksChange={setRemarks}
            onFileUpload={handleFileUpload}
            onAttachmentCheck={handleAttachmentCheck}
          />
        </div>
      </section>

      
      <style jsx global>{`
        .aspect-container {
          width: 100%;
          max-width: 1440px;
          margin: auto;
          aspect-ratio: 16 / 9;
          display: flex;
          flex-direction: column;
          background-color: white;
          border-radius: 0.75rem;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
          overflow: hidden;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgb(243 244 246);
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgb(156 163 175);
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgb(107 114 128);
        }
      `}</style>
    </div>
  )
}