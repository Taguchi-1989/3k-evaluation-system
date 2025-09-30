'use client'

import { FileUpload } from '@/components/ui'

export interface SummaryPanelProps {
  kitsusaScore?: number
  threekIndex?: string
  remarks?: string
  onRemarksChange?: (value: string) => void
  onAttachmentCheck?: () => void
  onFileUpload?: (files: File[]) => void
  className?: string
}

export function SummaryPanel({
  kitsusaScore = 7,
  threekIndex = 'IV',
  remarks = '',
  onRemarksChange,
  onAttachmentCheck,
  onFileUpload,
  className = ''
}: SummaryPanelProps) {

  return (
    <div className={`w-1/3 space-y-3 flex flex-col h-full ${className}`}>
      {/* サマリー表示 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-100 rounded-lg p-3 text-center">
          <h3 className="text-xs font-medium text-gray-600">作業のキツさ</h3>
          <p className="text-3xl font-bold text-gray-800">{kitsusaScore}</p>
        </div>
        <div className="bg-gray-100 rounded-lg p-3 text-center">
          <h3 className="text-xs font-medium text-gray-600">3K指数</h3>
          <p className="text-3xl font-bold text-red-600">{threekIndex}</p>
        </div>
      </div>
      
      {/* 備考入力エリア */}
      <div className="flex-grow flex flex-col">
        <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
          備考
        </label>
        <textarea
          id="remarks"
          value={remarks}
          onChange={(e) => onRemarksChange?.(e.target.value)}
          className="mt-1 block w-full flex-grow rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm resize-none"
          placeholder="申し送り事項などを記入..."
        />
      </div>
      
      {/* ファイルアップロードエリア */}
      <div className="flex-shrink-0">
        <FileUpload
          variant="default"
          layout="horizontal"
          size="md"
          onFileUpload={onFileUpload}
          onAttachmentCheck={onAttachmentCheck}
          className=""
        />
      </div>
    </div>
  )
}