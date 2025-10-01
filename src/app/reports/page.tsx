'use client'

import { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/Button'
import type { GeneratedReport } from '@/lib/reportGenerator'
import { useEvaluationData } from '@/hooks/useEvaluationData'

const ReportGenerator = dynamic(() => import('@/components/report/ReportGenerator'), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
  ssr: false
})

const ReportHistory = dynamic(() => import('@/components/report/ReportHistory'), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
  ssr: false
})

type TabType = 'generate' | 'history' | 'templates' | 'analytics';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('generate');
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string>('');
  const { evaluations } = useEvaluationData();

  const handleReportGenerated = (report: GeneratedReport) => {
    // localStorage に保存
    const existingReports = JSON.parse(localStorage.getItem('3k_report_history') || '[]');
    const updatedReports = [{
      ...report,
      downloadCount: 0,
      lastDownloaded: undefined,
      sharedWith: []
    }, ...existingReports];
    localStorage.setItem('3k_report_history', JSON.stringify(updatedReports));

    // 生成後は履歴タブに切り替え
    setActiveTab('history');
  };

  const handleSelectReport = (_reportId: string) => {
    // レポートの詳細表示（実装に応じて）
    // console.log('Selected report:', reportId);
  };

  const handleDeleteReport = (_reportId: string) => {
    // レポート削除の実装は今後追加予定
  };

  const tabs = [
    { key: 'generate' as TabType, label: 'レポート生成', icon: '📊' },
    { key: 'history' as TabType, label: 'レポート履歴', icon: '📋' },
    { key: 'templates' as TabType, label: 'テンプレート', icon: '📄' },
    { key: 'analytics' as TabType, label: '分析', icon: '📈' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'generate':
        return (
          <Suspense fallback={
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }>
            <ReportGenerator
              evaluationId={selectedEvaluationId}
              onReportGenerated={handleReportGenerated}
            />
          </Suspense>
        );

      case 'history':
        return (
          <Suspense fallback={
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }>
            <ReportHistory
              onSelectReport={handleSelectReport}
              onDeleteReport={handleDeleteReport}
            />
          </Suspense>
        );

      case 'templates':
        return <TemplatesTab />;

      case 'analytics':
        return <AnalyticsTab />;

      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="text-xl font-bold">レポート管理</h1>
        
        <div className="flex items-center space-x-4">
          {/* 評価選択 */}
          {evaluations.length > 0 && activeTab === 'generate' && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">対象評価:</label>
              <select
                value={selectedEvaluationId}
                onChange={(e) => setSelectedEvaluationId(e.target.value)}
                className="p-2 border rounded text-sm"
              >
                <option value="">最新の評価</option>
                {evaluations.map(evaluation => (
                  <option key={evaluation.id} value={evaluation.id}>
                    {evaluation.workName} ({evaluation.factoryName})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </header>

      <main className="page-content">
        <div className="max-w-7xl mx-auto p-6">
          {/* タブナビゲーション */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* タブコンテンツ */}
          <div className="min-h-96">
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

// テンプレートタブコンポーネント
function TemplatesTab() {
  const [templates, setTemplates] = useState([
    {
      id: 'standard',
      name: '標準レポートテンプレート',
      description: '基本的な3K評価レポート用のテンプレート',
      sections: ['サマリー', '詳細分析', '推奨事項', 'データ詳細'],
      isDefault: true,
      lastModified: new Date(),
      usage: 24
    },
    {
      id: 'management',
      name: '管理者向けレポート',
      description: '経営陣や管理者向けの要約レポート',
      sections: ['エグゼクティブサマリー', '主要リスク', '改善計画', 'ROI分析'],
      isDefault: false,
      lastModified: new Date(Date.now() - 86400000 * 7),
      usage: 12
    },
    {
      id: 'technical',
      name: '技術者向け詳細レポート',
      description: '技術的な詳細を含む詳細分析レポート',
      sections: ['技術分析', 'マトリクス詳細', '計算式', '測定データ', '改善提案'],
      isDefault: false,
      lastModified: new Date(Date.now() - 86400000 * 14),
      usage: 8
    }
  ]);

  const handleCreateTemplate = () => {
    // テンプレート作成ダイアログの表示
    alert('テンプレート作成機能は開発中です');
  };

  const handleEditTemplate = (templateId: string) => {
    // テンプレート編集画面への遷移
    alert(`テンプレート "${templateId}" の編集機能は開発中です`);
  };

  const handleDuplicateTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const newTemplate = {
        ...template,
        id: `${template.id}_copy_${Date.now()}`,
        name: `${template.name} (コピー)`,
        isDefault: false,
        lastModified: new Date(),
        usage: 0
      };
      setTemplates(prev => [...prev, newTemplate]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">レポートテンプレート</h2>
          <Button onClick={handleCreateTemplate} variant="primary">
            新規テンプレート作成
          </Button>
        </div>

        <div className="space-y-4">
          {templates.map(template => (
            <div key={template.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium">{template.name}</h3>
                    {template.isDefault && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                        デフォルト
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>含まれるセクション:</strong> {template.sections.join(', ')}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>使用回数: {template.usage}回</span>
                      <span>最終更新: {template.lastModified.toLocaleDateString('ja-JP')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleEditTemplate(template.id)}
                    variant="outline"
                    size="sm"
                  >
                    編集
                  </Button>
                  <Button
                    onClick={() => handleDuplicateTemplate(template.id)}
                    variant="ghost"
                    size="sm"
                  >
                    複製
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">テンプレート機能について</h3>
        
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium">📝 カスタムテンプレート</h4>
            <p className="text-gray-600 mt-1">
              組織のニーズに合わせたレポート形式を作成し、一貫性のある報告書を生成できます。
            </p>
          </div>
          
          <div>
            <h4 className="font-medium">🔧 編集可能な要素</h4>
            <ul className="text-gray-600 mt-1 space-y-1 ml-4">
              <li>• ヘッダー・フッターのカスタマイズ</li>
              <li>• セクションの追加・削除・順序変更</li>
              <li>• チャートの種類と配置</li>
              <li>• 企業ロゴやブランディング要素</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium">📊 テンプレート種類</h4>
            <ul className="text-gray-600 mt-1 space-y-1 ml-4">
              <li>• <strong>標準版</strong>: 一般的な評価レポート</li>
              <li>• <strong>管理者版</strong>: エグゼクティブサマリー中心</li>
              <li>• <strong>技術者版</strong>: 詳細データと計算式を含む</li>
              <li>• <strong>カスタム版</strong>: 組織固有の要件に対応</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// 分析タブコンポーネント
function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">レポート利用統計</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 border rounded">
            <div className="text-3xl font-bold text-blue-600 mb-2">42</div>
            <div className="text-sm text-gray-600">今月の生成数</div>
            <div className="text-xs text-green-600 mt-1">↑15% 前月比</div>
          </div>
          
          <div className="text-center p-4 border rounded">
            <div className="text-3xl font-bold text-green-600 mb-2">128</div>
            <div className="text-sm text-gray-600">総ダウンロード数</div>
            <div className="text-xs text-green-600 mt-1">↑22% 前月比</div>
          </div>
          
          <div className="text-center p-4 border rounded">
            <div className="text-3xl font-bold text-orange-600 mb-2">3.2</div>
            <div className="text-sm text-gray-600">平均ダウンロード数</div>
            <div className="text-xs text-gray-600 mt-1">レポートあたり</div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">人気のレポート形式</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded">
            <div className="flex items-center space-x-3">
              <span>📄</span>
              <span className="font-medium">PDF</span>
            </div>
            <div className="text-right">
              <div className="font-bold">68%</div>
              <div className="text-xs text-gray-500">234回</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded">
            <div className="flex items-center space-x-3">
              <span>🌐</span>
              <span className="font-medium">HTML</span>
            </div>
            <div className="text-right">
              <div className="font-bold">22%</div>
              <div className="text-xs text-gray-500">76回</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded">
            <div className="flex items-center space-x-3">
              <span>📝</span>
              <span className="font-medium">Word</span>
            </div>
            <div className="text-right">
              <div className="font-bold">10%</div>
              <div className="text-xs text-gray-500">34回</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">改善提案</h3>
        
        <div className="space-y-4 text-sm">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-medium text-blue-800 mb-2">📈 自動化の推奨</h4>
            <p className="text-blue-700">
              定期的なレポート生成が多く見られます。自動スケジュール機能の導入を検討してください。
            </p>
          </div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <h4 className="font-medium text-green-800 mb-2">🎯 テンプレート最適化</h4>
            <p className="text-green-700">
              標準テンプレートの使用率が高いです。組織固有のカスタムテンプレートの作成を推奨します。
            </p>
          </div>
          
          <div className="p-4 bg-orange-50 border border-orange-200 rounded">
            <h4 className="font-medium text-orange-800 mb-2">📊 データ活用促進</h4>
            <p className="text-orange-700">
              履歴データの活用率が低いです。トレンド分析機能の利用を促進してください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}