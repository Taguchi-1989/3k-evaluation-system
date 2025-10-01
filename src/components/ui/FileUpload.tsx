'use client'

import { useState } from 'react'
import { Button } from './Button'
import { FilePreview } from './FilePreview'

interface AttachedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
}

export interface FileUploadProps {
  variant?: 'default' | 'photo' | 'document'
  layout?: 'horizontal' | 'vertical' | 'grid'
  size?: 'sm' | 'md' | 'lg'
  onFileUpload?: (files: FileList) => void
  onAttachmentCheck?: () => void
  label?: string
  showButton?: boolean
  buttonText?: string
  accept?: string
  multiple?: boolean
  className?: string
  showAttachedFiles?: boolean
  attachedFiles?: AttachedFile[]
}

export function FileUpload({
  variant = 'default',
  layout = 'horizontal',
  size = 'md',
  onFileUpload,
  onAttachmentCheck,
  label,
  showButton = true,
  buttonText = '添付確認',
  accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  multiple = true,
  className = '',
  showAttachedFiles = false,
  attachedFiles = []
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [previewFile, setPreviewFile] = useState<AttachedFile | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      onFileUpload?.(files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      onFileUpload?.(files)
    }
  }

  const getIcon = () => {
    if (variant === 'photo') {
      return (
        <svg className="mx-auto h-5 w-5 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }
    
    return (
      <svg className="mx-auto h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    )
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-1 h-12'
      case 'lg':
        return 'p-4 h-20'
      default:
        return 'p-2 h-16'
    }
  }

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-[9px]'
      case 'lg':
        return 'text-sm'
      default:
        return 'text-[10px]'
    }
  }

  const getLabel = () => {
    if (label) return label
    
    switch (variant) {
      case 'photo':
        return '写真を追加 (D&D)'
      case 'document':
        return '基準書を追加 (D&D)'
      default:
        return '資料 D&D (基準書等)'
    }
  }

  if (layout === 'grid') {
    // 2x2 グリッドレイアウト（画面5のような配置）
    return (
      <div className="grid grid-cols-2 gap-2 flex-shrink-0">
        <div
          className={`border-2 border-dashed ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'} rounded-lg text-center flex flex-col justify-center items-center cursor-pointer hover:border-gray-400 transition-colors ${getSizeClasses()}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload-photo')?.click()}
        >
          <svg className="mx-auto h-5 w-5 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className={`mt-1 ${getTextSize()} text-gray-600`}>写真を追加 (D&D)</p>
        </div>
        <div
          className={`border-2 border-dashed ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'} rounded-lg text-center flex flex-col justify-center items-center cursor-pointer hover:border-gray-400 transition-colors ${getSizeClasses()}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload-doc')?.click()}
        >
          {getIcon()}
          <p className={`mt-1 ${getTextSize()} text-gray-600`}>基準書を追加 (D&D)</p>
        </div>
        <input
          id="file-upload-photo"
          type="file"
          multiple={multiple}
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        <input
          id="file-upload-doc"
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    )
  }

  if (layout === 'horizontal') {
    // 水平レイアウト（メイン画面のような配置）
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div
          className={`flex-grow border-2 border-dashed ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'} rounded-lg text-center flex flex-col justify-center items-center cursor-pointer hover:border-gray-400 transition-colors ${getSizeClasses()}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          {getIcon()}
          <p className={`mt-1 ${getTextSize()} text-gray-600`}>{getLabel()}</p>
        </div>
        
        <input
          id="file-upload"
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />
        
        {showButton && (
          <Button
            variant="outline"
            size="sm"
            className="text-[11px] font-medium px-2.5 py-1 flex-shrink-0"
            onClick={onAttachmentCheck}
          >
            {buttonText}
          </Button>
        )}
      </div>
    )
  }

  // 垂直レイアウト（その他の配置）
  return (
    <div className={`space-y-2 ${className}`}>
      <div
        className={`border-2 border-dashed ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'} rounded-lg text-center flex flex-col justify-center items-center cursor-pointer hover:border-gray-400 transition-colors ${getSizeClasses()}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        {getIcon()}
        <p className={`mt-1 ${getTextSize()} text-gray-600`}>{getLabel()}</p>
      </div>
      
      <input
        id="file-upload"
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
      />
      
      {showButton && (
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            className="text-[11px] font-medium px-2.5 py-1"
            onClick={onAttachmentCheck}
          >
            {buttonText}
          </Button>
        </div>
      )}
    </div>
  )

  // ヘルパー関数を追加
  const getFileType = (fileName: string): 'pdf' | 'image' | 'document' | 'unknown' => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'pdf':
        return 'pdf'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'webp':
        return 'image'
      case 'doc':
      case 'docx':
      case 'txt':
      case 'rtf':
        return 'document'
      default:
        return 'unknown'
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  const handlePreview = (file: AttachedFile) => {
    setPreviewFile(file)
  }

  // 元の return文の前に添付ファイル一覧を挿入
  const mainComponent = (
    <div className={`space-y-2 ${className}`}>
      {/* 既存のFileUpload部分 */}
      {layout === 'grid' ? (
        <div className="grid grid-cols-2 gap-2 flex-shrink-0">
          <div
            className={`border-2 border-dashed ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'} rounded-lg text-center flex flex-col justify-center items-center cursor-pointer hover:border-gray-400 transition-colors ${getSizeClasses()}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload-photo')?.click()}
          >
            <svg className="mx-auto h-5 w-5 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className={`mt-1 ${getTextSize()} text-gray-600`}>写真を追加 (D&D)</p>
          </div>
          <div
            className={`border-2 border-dashed ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'} rounded-lg text-center flex flex-col justify-center items-center cursor-pointer hover:border-gray-400 transition-colors ${getSizeClasses()}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload-doc')?.click()}
          >
            {getIcon()}
            <p className={`mt-1 ${getTextSize()} text-gray-600`}>基準書を追加 (D&D)</p>
          </div>
          <input
            id="file-upload-photo"
            type="file"
            multiple={multiple}
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          <input
            id="file-upload-doc"
            type="file"
            multiple={multiple}
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      ) : layout === 'horizontal' ? (
        <div className={`flex items-center gap-2`}>
          <div
            className={`flex-grow border-2 border-dashed ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'} rounded-lg text-center flex flex-col justify-center items-center cursor-pointer hover:border-gray-400 transition-colors ${getSizeClasses()}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            {getIcon()}
            <p className={`mt-1 ${getTextSize()} text-gray-600`}>{getLabel()}</p>
          </div>
          
          <input
            id="file-upload"
            type="file"
            multiple={multiple}
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
          />
          
          {showButton && (
            <Button
              variant="outline"
              size="sm"
              className="text-[11px] font-medium px-2.5 py-1 flex-shrink-0"
              onClick={onAttachmentCheck}
            >
              {buttonText}
            </Button>
          )}
        </div>
      ) : (
        <div>
          <div
            className={`border-2 border-dashed ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'} rounded-lg text-center flex flex-col justify-center items-center cursor-pointer hover:border-gray-400 transition-colors ${getSizeClasses()}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            {getIcon()}
            <p className={`mt-1 ${getTextSize()} text-gray-600`}>{getLabel()}</p>
          </div>
          
          <input
            id="file-upload"
            type="file"
            multiple={multiple}
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
          />
          
          {showButton && (
            <div className="text-center">
              <Button
                variant="outline"
                size="sm"
                className="text-[11px] font-medium px-2.5 py-1"
                onClick={onAttachmentCheck}
              >
                {buttonText}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 添付ファイル一覧 */}
      {showAttachedFiles && attachedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">添付ファイル</h4>
          <div className="space-y-2">
            {attachedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded border"
              >
                <div className="flex items-center space-x-2 flex-grow">
                  <div className="flex-shrink-0">
                    {getFileType(file.name) === 'pdf' && (
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                    )}
                    {getFileType(file.name) === 'image' && (
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
                      </svg>
                    )}
                    {getFileType(file.name) === 'document' && (
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                    )}
                    {getFileType(file.name) === 'unknown' && (
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePreview(file)}
                    className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    title="プレビュー"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <a
                    href={file.url}
                    download={file.name}
                    className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                    title="ダウンロード"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ファイルプレビューモーダル */}
      {previewFile && (
        <FilePreview
          fileName={previewFile?.name ?? ''}
          fileUrl={previewFile?.url ?? ''}
          fileType={getFileType(previewFile?.name ?? '')}
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  )

  return mainComponent
}