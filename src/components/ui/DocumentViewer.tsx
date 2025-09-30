'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'

interface DocumentFile {
  id: string
  name: string
  type: string
  url: string
  size: number
}

interface DocumentViewerProps {
  documents?: DocumentFile[]
  onFileUpload?: (files: File[]) => void
  className?: string
}

export function DocumentViewer({
  documents = [],
  onFileUpload,
  className = ''
}: DocumentViewerProps) {
  const [selectedDocument, setSelectedDocument] = useState<DocumentFile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0 && onFileUpload) {
      onFileUpload(files)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string): string => {
    if (type.includes('pdf')) return '📄'
    if (type.includes('image')) return '🖼️'
    if (type.includes('video')) return '🎥'
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊'
    if (type.includes('word') || type.includes('document')) return '📝'
    return '📎'
  }

  return (
    <div className={`flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white">資料閲覧</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={handleUploadClick}
            className="text-xs"
          >
            ファイル追加
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.mov"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <div className="flex-1 flex min-h-0">
        {/* ファイル一覧 */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          {documents.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
              資料がありません
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocument(doc)}
                  className={`p-2 rounded cursor-pointer border transition-colors ${
                    selectedDocument?.id === doc.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-transparent'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <span className="text-lg flex-shrink-0">
                      {getFileIcon(doc.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                        {doc.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(doc.size)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* プレビューエリア */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900">
          {selectedDocument ? (
            <div className="h-full flex flex-col">
              <div className="p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {selectedDocument.name}
                </h4>
              </div>
              <div className="flex-1 p-3">
                {selectedDocument.type.includes('pdf') ? (
                  <iframe
                    src={selectedDocument.url}
                    className="w-full h-full border-0 rounded"
                    title={selectedDocument.name}
                  />
                ) : selectedDocument.type.includes('image') ? (
                  <img
                    src={selectedDocument.url}
                    alt={selectedDocument.name}
                    className="max-w-full max-h-full object-contain mx-auto"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-4xl mb-2">
                        {getFileIcon(selectedDocument.type)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        プレビューできません
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(selectedDocument.url, '_blank')}
                        className="mt-2"
                      >
                        ファイルを開く
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">📄</div>
                <p className="text-sm">
                  左側からファイルを選択してください
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}