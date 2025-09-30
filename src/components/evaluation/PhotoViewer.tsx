'use client'

import { useState } from 'react'

export interface PhotoViewerProps {
  mainPhoto?: string
  thumbnails?: string[]
  onPhotoSelect?: (index: number) => void
  className?: string
  showGalleryInfo?: boolean
  galleryTitle?: string
}

export function PhotoViewer({
  mainPhoto = 'https://placehold.co/600x450/111827/ffffff?text=Main+Photo',
  thumbnails = [
    'https://placehold.co/120x90/e2e8f0/475569?text=Photo+1',
    'https://placehold.co/120x90/e2e8f0/475569?text=Photo+2',
    'https://placehold.co/120x90/e2e8f0/475569?text=Photo+3',
    'https://placehold.co/120x90/e2e8f0/475569?text=Photo+4',
    'https://placehold.co/120x90/e2e8f0/475569?text=Photo+5',
    'https://placehold.co/120x90/e2e8f0/475569?text=Photo+6'
  ],
  onPhotoSelect,
  className = '',
  showGalleryInfo = false,
  galleryTitle = '登録済み写真'
}: PhotoViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index)
    onPhotoSelect?.(index)
  }

  return (
    <div className={`w-full sm:w-2/5 md:w-1/3 lg:w-1/4 xl:w-1/3 flex flex-col h-full space-y-2 ${className}`}>
      {/* メイン写真表示エリア */}
      <div className="flex-grow bg-gray-900 rounded-lg flex items-center justify-center p-2">
        <img 
          src={thumbnails[selectedIndex] || mainPhoto} 
          className="photo-viewer-main rounded" 
          alt="メイン表示写真"
        />
      </div>
      
      {/* サムネイル一覧 */}
      <div className="flex-shrink-0">
        {showGalleryInfo && (
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">{galleryTitle}</h3>
            <span className="text-xs text-gray-500">{thumbnails.length}枚</span>
          </div>
        )}
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-thin max-w-full">
          {thumbnails.map((thumbnail, index) => (
            <div key={index} className="flex-shrink-0 relative">
              <img
                src={thumbnail}
                className={`photo-viewer-thumbnail rounded-md h-12 w-auto max-w-16 cursor-pointer transition-all duration-200 ${
                  index === selectedIndex 
                    ? 'border-2 border-blue-500 opacity-100 highlight-selected dark:border-blue-400' 
                    : 'opacity-70 hover:opacity-100 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                alt={`サムネイル${index + 1}`}
                onClick={() => handleThumbnailClick(index)}
              />
              {showGalleryInfo && (
                <span className="absolute -bottom-1 -right-1 bg-gray-800 text-white text-xs px-1 rounded-full">
                  {index + 1}
                </span>
              )}
            </div>
          ))}
        </div>
        {showGalleryInfo && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            選択中: {selectedIndex + 1} / {thumbnails.length}
          </div>
        )}
      </div>
    </div>
  )
}