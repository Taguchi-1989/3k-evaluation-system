'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import type { GeneratedReport } from '@/lib/reportGenerator'

interface ReportHistoryItem extends GeneratedReport {
  downloadCount: number;
  lastDownloaded?: Date;
  sharedWith?: string[];
}

interface ReportHistoryProps {
  onSelectReport?: (reportId: string) => void;
  onDeleteReport?: (reportId: string) => void;
}

export default function ReportHistory({ onSelectReport, onDeleteReport }: ReportHistoryProps): React.JSX.Element {
  const [reports, setReports] = useState<ReportHistoryItem[]>([]);
  const [filteredReports, setFilteredReports] = useState<ReportHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFormat, setFilterFormat] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'downloads'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedReports, setSelectedReports] = useState<string[]>([]);

  // サンプルデータの読み込み（実際の実装ではlocalStorageやAPIから取得）
  useEffect(() => {
    loadReportHistory();
  }, []);

  // フィルタリングと検索の適用
  useEffect(() => {
    let filtered = reports;

    // 検索クエリでフィルタリング
    if (searchQuery) {
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reportId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // フォーマットでフィルタリング
    if (filterFormat !== 'all') {
      filtered = filtered.filter(report => report.metadata.format === filterFormat);
    }

    // ソート
    filtered.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortBy) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'downloads':
          aValue = a.downloadCount;
          bValue = b.downloadCount;
          break;
        case 'date':
        default:
          aValue = a.metadata.generatedAt;
          bValue = b.metadata.generatedAt;
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredReports(filtered);
  }, [reports, searchQuery, filterFormat, sortBy, sortOrder]);

  const loadReportHistory = (): void => {
    // 実際の実装ではAPIやlocalStorageから読み込み
    const savedReports = localStorage.getItem('3k_report_history');
    if (savedReports) {
      try {
        const parsed = JSON.parse(savedReports) as Array<Record<string, unknown>>;
        setReports(parsed.map((r): ReportHistoryItem => ({
          ...(r as ReportHistoryItem),
          metadata: {
            ...((r.metadata as Record<string, unknown>) || {}),
            generatedAt: new Date((r.metadata as { generatedAt: string }).generatedAt)
          },
          lastDownloaded: r.lastDownloaded ? new Date(r.lastDownloaded as string) : undefined
        })));
      } catch (error) {
        console.error('レポート履歴の読み込みエラー:', error);
        setReports([]);
      }
    } else {
      // サンプルデータ
      setReports([
        {
          reportId: 'report_001',
          title: '3K評価レポート - 重量物運搬作業 (工場A)',
          content: '...',
          metadata: {
            generatedAt: new Date(Date.now() - 86400000), // 1日前
            generatedBy: 'System',
            format: 'pdf',
            pageCount: 12,
            fileSize: 2048000
          },
          sections: [],
          downloadCount: 5,
          lastDownloaded: new Date(Date.now() - 3600000), // 1時間前
          sharedWith: ['manager@company.com', 'safety@company.com']
        },
        {
          reportId: 'report_002',
          title: '3K評価レポート - 組立作業 (工場B)',
          content: '...',
          metadata: {
            generatedAt: new Date(Date.now() - 172800000), // 2日前
            generatedBy: 'System',
            format: 'html',
            pageCount: 8,
            fileSize: 1024000
          },
          sections: [],
          downloadCount: 2,
          lastDownloaded: new Date(Date.now() - 7200000) // 2時間前
        }
      ]);
    }
  };

  const saveReportHistory = (updatedReports: ReportHistoryItem[]) => {
    localStorage.setItem('3k_report_history', JSON.stringify(updatedReports));
    setReports(updatedReports);
  };

  const handleDownloadReport = (reportId: string) => {
    const updatedReports = reports.map(report => {
      if (report.reportId === reportId) {
        return {
          ...report,
          downloadCount: report.downloadCount + 1,
          lastDownloaded: new Date()
        };
      }
      return report;
    });
    
    saveReportHistory(updatedReports);
    
    // 実際のダウンロード処理
    const report = updatedReports.find(r => r.reportId === reportId);
    if (report) {
      const blob = new Blob([report.content], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title}.${report.metadata.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleDeleteReport = (reportId: string) => {
    if (confirm('このレポートを削除してもよろしいですか？')) {
      const updatedReports = reports.filter(r => r.reportId !== reportId);
      saveReportHistory(updatedReports);
      onDeleteReport?.(reportId);
    }
  };

  const handleBulkDelete = () => {
    if (selectedReports.length === 0) return;
    
    if (confirm(`選択された${selectedReports.length}件のレポートを削除してもよろしいですか？`)) {
      const updatedReports = reports.filter(r => !selectedReports.includes(r.reportId));
      saveReportHistory(updatedReports);
      setSelectedReports([]);
    }
  };

  const handleSelectAll = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map(r => r.reportId));
    }
  };

  const toggleSelectReport = (reportId: string) => {
    setSelectedReports(prev => 
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return '📄';
      case 'html': return '🌐';
      case 'docx': return '📝';
      default: return '📋';
    }
  };

  const getFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
    return `${Math.round(bytes / (1024 * 1024))}MB`;
  };

  return (
    <div className="space-y-6">
      {/* ヘッダーとフィルター */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">レポート履歴</h2>
        
        {/* 検索・フィルター */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="レポートを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            
            <select
              value={filterFormat}
              onChange={(e) => setFilterFormat(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="all">すべての形式</option>
              <option value="pdf">PDF</option>
              <option value="html">HTML</option>
              <option value="docx">Word文書</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm">並び順:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'downloads')}
                  className="p-1 border rounded text-sm"
                >
                  <option value="date">生成日時</option>
                  <option value="title">タイトル</option>
                  <option value="downloads">ダウンロード数</option>
                </select>
                
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1 border rounded text-sm hover:bg-gray-50"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            {selectedReports.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedReports.length}件選択中
                </span>
                <Button
                  onClick={handleBulkDelete}
                  variant="outline"
                  size="sm"
                >
                  一括削除
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          {filteredReports.length}件のレポート（全{reports.length}件中）
        </div>
      </div>

      {/* レポート一覧 */}
      <div className="card p-6">
        {filteredReports.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-2">レポートが見つかりません</p>
            <p className="text-sm text-gray-500">検索条件を変更するか、新しいレポートを生成してください</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* ヘッダー */}
            <div className="flex items-center p-3 border-b bg-gray-50 rounded-t">
              <input
                type="checkbox"
                checked={selectedReports.length === filteredReports.length}
                onChange={handleSelectAll}
                className="mr-3"
              />
              <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-2 font-medium text-sm">レポート名</div>
                <div className="font-medium text-sm">形式</div>
                <div className="font-medium text-sm">生成日時</div>
                <div className="font-medium text-sm">ダウンロード</div>
                <div className="font-medium text-sm">操作</div>
              </div>
            </div>

            {/* レポート項目 */}
            {filteredReports.map((report) => (
              <div
                key={report.reportId}
                className={`flex items-center p-3 border-b hover:bg-gray-50 transition-colors ${
                  selectedReports.includes(report.reportId) ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedReports.includes(report.reportId)}
                  onChange={() => toggleSelectReport(report.reportId)}
                  className="mr-3"
                />
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4">
                  {/* レポート名とメタデータ */}
                  <div className="md:col-span-2">
                    <div className="font-medium text-sm mb-1">
                      {report.title}
                    </div>
                    <div className="text-xs text-gray-500 space-x-2">
                      <span>{report.metadata.pageCount}ページ</span>
                      <span>•</span>
                      <span>{getFileSize(report.metadata.fileSize || 0)}</span>
                      {report.lastDownloaded && (
                        <>
                          <span>•</span>
                          <span>最終DL: {report.lastDownloaded.toLocaleDateString('ja-JP')}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 形式 */}
                  <div className="flex items-center">
                    <span className="mr-1">{getFormatIcon(report.metadata.format)}</span>
                    <span className="text-sm uppercase">{report.metadata.format}</span>
                  </div>

                  {/* 生成日時 */}
                  <div className="text-sm">
                    {report.metadata.generatedAt.toLocaleDateString('ja-JP')}
                    <div className="text-xs text-gray-500">
                      {report.metadata.generatedAt.toLocaleTimeString('ja-JP', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>

                  {/* ダウンロード数 */}
                  <div className="text-sm">
                    <div className="flex items-center">
                      <span className="mr-1">📥</span>
                      <span>{report.downloadCount}回</span>
                    </div>
                  </div>

                  {/* 操作ボタン */}
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleDownloadReport(report.reportId)}
                      variant="outline"
                      size="sm"
                    >
                      DL
                    </Button>
                    
                    {onSelectReport && (
                      <Button
                        onClick={() => onSelectReport(report.reportId)}
                        variant="ghost"
                        size="sm"
                      >
                        表示
                      </Button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteReport(report.reportId)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="削除"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 統計情報 */}
      {reports.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">統計情報</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{reports.length}</div>
              <div className="text-sm text-gray-600">総レポート数</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {reports.reduce((sum, r) => sum + r.downloadCount, 0)}
              </div>
              <div className="text-sm text-gray-600">総ダウンロード数</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(reports.reduce((sum, r) => sum + (r.metadata.fileSize || 0), 0) / (1024 * 1024))}MB
              </div>
              <div className="text-sm text-gray-600">総ファイルサイズ</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {reports.filter(r => r.metadata.generatedAt > new Date(Date.now() - 7 * 86400000)).length}
              </div>
              <div className="text-sm text-gray-600">過去7日の生成数</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}