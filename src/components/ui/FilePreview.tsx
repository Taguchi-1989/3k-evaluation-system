'use client'

import { useState } from 'react'

export interface FilePreviewProps {
  fileName: string
  fileUrl: string
  fileType: 'pdf' | 'image' | 'document' | 'unknown'
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function FilePreview({
  fileName,
  fileUrl,
  fileType,
  isOpen,
  onClose,
  className = ''
}: FilePreviewProps) {
  const [isLoading, setIsLoading] = useState(true)

  if (!isOpen) return null

  const getFileIcon = () => {
    switch (fileType) {
      case 'pdf':
        return (
          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        )
      case 'image':
        return (
          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
          </svg>
        )
      case 'document':
        return (
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        )
      default:
        return (
          <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        )
    }
  }

  const renderPreviewContent = () => {
    switch (fileType) {
      case 'pdf':
        return (
          <div className="w-full h-full flex flex-col">
            {isLoading && (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500 dark:text-gray-400">PDFを読み込み中...</div>
              </div>
            )}
            <iframe
              src={fileUrl}
              className="w-full flex-grow border-0"
              style={{ minHeight: '600px' }}
              onLoad={() => setIsLoading(false)}
              title={`PDF Preview: ${fileName}`}
            />
          </div>
        )
      
      case 'image':
        return (
          <div className="flex items-center justify-center h-full max-h-[80vh]">
            {isLoading && (
              <div className="text-gray-500 dark:text-gray-400">画像を読み込み中...</div>
            )}
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full max-h-full object-contain"
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          </div>
        )
      
      case 'document':
        return (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            {getFileIcon()}
            <div className="text-center">
              <p className="text-gray-700 dark:text-gray-300 mb-2">文書ファイルのプレビューは利用できません</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">ファイルをダウンロードして表示してください</p>
            </div>
            <a
              href={fileUrl}
              download={fileName}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              ファイルをダウンロード
            </a>
          </div>
        )
      
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            {getFileIcon()}
            <div className="text-center">
              <p className="text-gray-700 dark:text-gray-300 mb-2">プレビューが利用できないファイル形式です</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">ファイルをダウンロードして表示してください</p>
            </div>
            <a
              href={fileUrl}
              download={fileName}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              ファイルをダウンロード
            </a>
          </div>
        )
    }
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}>
      {/* 背景オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 dark:bg-opacity-85"
        onClick={onClose}
      ></div>
      
      {/* モーダルコンテンツ */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-3">
            {getFileIcon()}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{fileName}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {fileType.toUpperCase()} ファイル
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* ダウンロードボタン */}
            <a
              href={fileUrl}
              download={fileName}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="ダウンロード"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </a>
            
            {/* 閉じるボタン */}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="閉じる"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* プレビューコンテンツ */}
        <div className="flex-grow overflow-hidden p-4">
          {renderPreviewContent()}
        </div>
        
        {/* フッター */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-600 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}