'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
// アイコンはTextで代替表示

export interface ImageUploadProps {
  onImageSelect?: (files: File[]) => void
  onImageAnalyze?: (files: File[]) => void
  maxFiles?: number
  acceptedTypes?: string[]
  className?: string
}

export function ImageUpload({
  onImageSelect,
  onImageAnalyze,
  maxFiles = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className = ''
}: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(file => 
      acceptedTypes.includes(file.type) && file.size <= 10 * 1024 * 1024 // 10MB制限
    )

    if (validFiles.length + selectedFiles.length > maxFiles) {
      alert(`最大${maxFiles}枚までの画像を選択できます`)
      return
    }

    // プレビューURL生成
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file))
    
    setSelectedFiles(prev => [...prev, ...validFiles])
    setPreviewUrls(prev => [...prev, ...newPreviewUrls])

    if (onImageSelect) {
      onImageSelect([...selectedFiles, ...validFiles])
    }

    // ファイル入力をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreviews = previewUrls.filter((_, i) => i !== index)
    
    // 削除されるプレビューURLを解放
    const urlToRevoke = previewUrls[index];
    if (urlToRevoke) {
      URL.revokeObjectURL(urlToRevoke);
    }
    
    setSelectedFiles(newFiles)
    setPreviewUrls(newPreviews)

    if (onImageSelect) {
      onImageSelect(newFiles)
    }
  }

  const handleAnalyze = async () => {
    if (selectedFiles.length === 0 || !onImageAnalyze) return

    setIsAnalyzing(true)
    try {
      await onImageAnalyze(selectedFiles)
    } catch (error) {
      console.error('画像分析エラー:', error)
      alert('画像分析中にエラーが発生しました')
    }
    setIsAnalyzing(false)
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  const clearAll = () => {
    // 全てのプレビューURLを解放
    previewUrls.forEach(url => URL.revokeObjectURL(url))
    setSelectedFiles([])
    setPreviewUrls([])
    
    if (onImageSelect) {
      onImageSelect([])
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* ファイル選択エリア */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <span className="text-5xl text-gray-400 mx-auto mb-4 block">📷</span>
        <h3 className="text-lg font-medium text-gray-700 mb-2">作業写真をアップロード</h3>
        <p className="text-gray-500 mb-4">
          JPG、PNG、WebP形式の画像ファイルを選択してください（最大{maxFiles}枚、各10MBまで）
        </p>
        <Button
          onClick={triggerFileSelect}
          variant="outline"
          className="flex items-center gap-2 mx-auto"
          disabled={selectedFiles.length >= maxFiles}
        >
          <span className="text-sm">⬆️</span>
          画像を選択
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* 選択済み画像プレビュー */}
      {selectedFiles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              選択済み画像 ({selectedFiles.length}/{maxFiles})
            </h4>
            <Button
              onClick={clearAll}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              全て削除
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative border rounded-lg overflow-hidden bg-gray-50">
                <div className="aspect-square">
                  <img
                    src={previewUrls[index]}
                    alt={`プレビュー ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* 画像情報オーバーレイ */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2">
                  <div className="text-xs truncate">{file.name}</div>
                  <div className="text-xs text-gray-300">
                    {(file.size / 1024 / 1024).toFixed(1)}MB
                  </div>
                </div>
                
                {/* 削除ボタン */}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <span className="text-xs">✕</span>
                </button>
                
                {/* プレビューボタン */}
                <button
                  onClick={() => {
                    // モーダルで大きく表示する機能（オプション）
                    window.open(previewUrls[index], '_blank')
                  }}
                  className="absolute top-2 left-2 bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition-colors"
                >
                  <span className="text-xs">👁️</span>
                </button>
              </div>
            ))}
          </div>

          {/* AI分析ボタン */}
          {onImageAnalyze && (
            <div className="flex justify-center">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || selectedFiles.length === 0}
                variant="primary"
                className="flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    分析中...
                  </>
                ) : (
                  <>
                    <span className="text-sm">📷</span>
                    AI画像分析を実行
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 使用方法のヒント */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h5 className="text-sm font-medium text-blue-800 mb-1">📸 効果的な写真撮影のコツ</h5>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• 作業者と作業環境が明確に写るようにする</li>
          <li>• 使用している工具や機械が識別できるアングルで撮影</li>
          <li>• 姿勢や動作が分かりやすい角度から撮影</li>
          <li>• 照明条件や環境要因（騒音源、化学物質など）も含める</li>
          <li>• 複数の角度から撮影すると分析精度が向上します</li>
        </ul>
      </div>
    </div>
  )
}