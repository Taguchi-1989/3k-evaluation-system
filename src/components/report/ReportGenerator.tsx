'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { ReportData, ReportConfig, GeneratedReport } from '@/lib/reportGenerator';
import { reportGenerator } from '@/lib/reportGenerator'
import { useEvaluationDataStore } from '@/stores/evaluationDataStore'
import type { PhysicalDetails, MentalDetails, EnvironmentalDetails, HazardDetails, WorkTimeFactor } from '@/types/evaluation'

interface ReportGeneratorProps {
  evaluationId?: string;
  onReportGenerated?: (report: GeneratedReport) => void;
}

export default function ReportGenerator({ evaluationId, onReportGenerated }: ReportGeneratorProps): React.JSX.Element {
  const { savedEvaluations, currentEvaluation } = useEvaluationDataStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [config, setConfig] = useState<ReportConfig>({
    includeCharts: true,
    includeRecommendations: true,
    includeHistoricalData: false,
    includeMatrixDetails: true,
    language: 'ja',
    format: 'pdf',
    template: 'standard'
  });
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // 評価データを取得
  const targetEvaluation = evaluationId
    ? savedEvaluations.find((e) => e.id === evaluationId)
    : currentEvaluation ?? savedEvaluations[0]; // 最新の評価

  const handleGenerateReport = async (): Promise<void> => {
    if (!targetEvaluation) {
      alert('評価データが見つかりません');
      return;
    }

    setIsGenerating(true);

    try {
      // レポートデータの準備
      // TODO: 評価スコアを計算するロジックが必要
      // 現時点では仮のデータを使用
      const reportData: ReportData = {
        evaluationResult: {
          evaluationId: targetEvaluation.id,
          scores: {
            physical: 0,
            mental: 0,
            environmental: 0,
            hazard: 0,
            workTime: 0
          },
          finalResult: {
            physicalScore: 0,
            mentalScore: 0,
            environmentalScore: 0,
            hazardScore: 0,
            workTimeScore: 0,
            final3KIndex: '0.0',
            finalKitsusaScore: 0,
            calculationDetails: {}
          },
          calculationDetails: {},
          timestamp: new Date(),
          calculatedBy: targetEvaluation.metadata?.creator?.name ?? 'System'
        },
        workInfo: {
          workName: targetEvaluation.workName,
          factoryName: targetEvaluation.factoryName,
          processName: targetEvaluation.processName || '未設定',
          evaluatedBy: targetEvaluation.metadata?.creator?.name ?? 'System',
          evaluatedDate: new Date(targetEvaluation.updatedAt),
          department: targetEvaluation.metadata?.creator?.department,
          shift: undefined
        },
        detailsData: {
          physical: targetEvaluation.physicalFactor as unknown as PhysicalDetails | undefined,
          mental: targetEvaluation.mentalFactor as unknown as MentalDetails | undefined,
          environmental: targetEvaluation.environmentalFactor as unknown as EnvironmentalDetails | undefined,
          hazard: targetEvaluation.hazardFactor as unknown as HazardDetails | undefined,
          postures: undefined,
          substances: undefined,
          workTime: targetEvaluation.workTimeFactor as unknown as WorkTimeFactor | undefined
        }
      };

      // 履歴データが有効な場合は追加
      if (config.includeHistoricalData && savedEvaluations.length > 1) {
        const historicalEvaluations = savedEvaluations
          .filter((e) => e.workName === targetEvaluation.workName)
          .slice(0, 5) // 最新5件
          .map((e) => ({
            evaluationId: e.id,
            scores: {
              physical: 0,
              mental: 0,
              environmental: 0,
              hazard: 0,
              workTime: 0
            },
            finalResult: {
              physicalScore: 0,
              mentalScore: 0,
              environmentalScore: 0,
              hazardScore: 0,
              workTimeScore: 0,
              final3KIndex: '0.0',
              finalKitsusaScore: 0,
              calculationDetails: {}
            },
            calculationDetails: {},
            timestamp: new Date(e.updatedAt),
            calculatedBy: e.metadata?.creator?.name ?? 'System'
          }));

        reportData.historicalData = {
          previousEvaluations: historicalEvaluations,
          trendAnalysis: {
            physicalTrend: 'stable',
            mentalTrend: 'stable',
            environmentalTrend: 'stable',
            hazardTrend: 'stable',
            overallTrend: 'stable',
            improvementRate: 0,
            riskReductionRate: 0
          }
        };
      }

      // レポート生成実行
      const report = await reportGenerator.generateReport(reportData, config);
      setGeneratedReport(report);
      onReportGenerated?.(report);
      
    } catch (error) {
      console.error('レポート生成エラー:', error);
      alert('レポート生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (format: 'pdf' | 'html' | 'docx'): void => {
    if (!generatedReport) return;

    const blob = new Blob([generatedReport.content], { 
      type: format === 'pdf' ? 'application/pdf' :
            format === 'html' ? 'text/html' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedReport.title}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!targetEvaluation) {
    return (
      <div className="card p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-4">レポート生成</h2>
          <p className="text-gray-600">生成対象の評価データがありません</p>
          <p className="text-sm text-gray-500 mt-2">先に評価を実施してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* レポート設定 */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">レポート生成設定</h2>
        
        <div className="space-y-4">
          {/* 基本設定 */}
          <div>
            <h3 className="text-sm font-medium mb-2">評価対象</h3>
            <div className="p-3 bg-gray-50 rounded">
              <p className="font-medium">{targetEvaluation.workName}</p>
              <p className="text-sm text-gray-600">{targetEvaluation.factoryName}</p>
              <p className="text-sm text-gray-500">
                最終更新: {new Date(targetEvaluation.updatedAt).toLocaleString('ja-JP')}
              </p>
            </div>
          </div>

          {/* フォーマット設定 */}
          <div>
            <label htmlFor="report-format" className="block text-sm font-medium mb-2">出力形式</label>
            <select
              id="report-format"
              className="w-full p-2 border rounded"
              value={config.format}
              onChange={(e) => setConfig(prev => ({ ...prev, format: e.target.value as 'pdf' | 'html' | 'docx' }))}
              aria-label="レポートの出力形式を選択"
            >
              <option value="pdf">PDF</option>
              <option value="html">HTML</option>
              <option value="docx">Word文書</option>
            </select>
          </div>

          {/* テンプレート設定 */}
          <div>
            <label htmlFor="report-template" className="block text-sm font-medium mb-2">レポートテンプレート</label>
            <select
              id="report-template"
              className="w-full p-2 border rounded"
              value={config.template}
              onChange={(e) => setConfig(prev => ({ ...prev, template: e.target.value as 'summary' | 'standard' | 'detailed' }))}
              aria-label="レポートテンプレートを選択"
            >
              <option value="summary">サマリー版</option>
              <option value="standard">標準版</option>
              <option value="detailed">詳細版</option>
            </select>
          </div>

          {/* 含める内容 */}
          <div>
            <h3 className="text-sm font-medium mb-2">含める内容</h3>
            <div className="space-y-2">
              <label htmlFor="include-charts" className="flex items-center">
                <input
                  id="include-charts"
                  type="checkbox"
                  checked={config.includeCharts}
                  onChange={(e) => setConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                  className="mr-2"
                  aria-label="グラフ・チャートを含める"
                />
                グラフ・チャート
              </label>
              <label htmlFor="include-recommendations" className="flex items-center">
                <input
                  id="include-recommendations"
                  type="checkbox"
                  checked={config.includeRecommendations}
                  onChange={(e) => setConfig(prev => ({ ...prev, includeRecommendations: e.target.checked }))}
                  className="mr-2"
                  aria-label="改善推奨事項を含める"
                />
                改善推奨事項
              </label>
              <label htmlFor="include-historical" className="flex items-center">
                <input
                  id="include-historical"
                  type="checkbox"
                  checked={config.includeHistoricalData}
                  onChange={(e) => setConfig(prev => ({ ...prev, includeHistoricalData: e.target.checked }))}
                  className="mr-2"
                  aria-label="履歴データ・トレンド分析を含める"
                />
                履歴データ・トレンド分析
              </label>
              <label htmlFor="include-matrix" className="flex items-center">
                <input
                  id="include-matrix"
                  type="checkbox"
                  checked={config.includeMatrixDetails}
                  onChange={(e) => setConfig(prev => ({ ...prev, includeMatrixDetails: e.target.checked }))}
                  className="mr-2"
                  aria-label="マトリクス計算詳細を含める"
                />
                マトリクス計算詳細
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <Button
            onClick={() => { void handleGenerateReport() }}
            disabled={isGenerating}
            variant="primary"
            className="flex-1"
          >
            {isGenerating ? '生成中...' : 'レポート生成'}
          </Button>
          
          {generatedReport && (
            <Button
              onClick={() => setPreviewMode(!previewMode)}
              variant="outline"
            >
              {previewMode ? 'プレビュー非表示' : 'プレビュー表示'}
            </Button>
          )}
        </div>
      </div>

      {/* 生成されたレポート情報 */}
      {generatedReport && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">生成されたレポート</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">レポートID</p>
                <p className="font-mono text-sm">{generatedReport.reportId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">生成日時</p>
                <p className="text-sm">{generatedReport.metadata.generatedAt.toLocaleString('ja-JP')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ページ数</p>
                <p className="text-sm">{generatedReport.metadata.pageCount}ページ</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ファイルサイズ</p>
                <p className="text-sm">{Math.round((generatedReport.metadata.fileSize || 0) / 1024)}KB</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => handleDownload('pdf')}
                variant="primary"
                size="sm"
              >
                PDF ダウンロード
              </Button>
              <Button
                onClick={() => handleDownload('html')}
                variant="outline"
                size="sm"
              >
                HTML ダウンロード
              </Button>
              <Button
                onClick={() => handleDownload('docx')}
                variant="outline"
                size="sm"
              >
                Word ダウンロード
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* レポートプレビュー */}
      {previewMode && generatedReport && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">レポートプレビュー</h2>
          
          <div className="border rounded p-4 bg-gray-50 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm">{generatedReport.content}</pre>
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">セクション一覧</h3>
            <div className="space-y-1">
              {generatedReport.sections.map((section) => (
                <div key={section.id} className="flex items-center justify-between text-sm">
                  <span>{section.title}</span>
                  <span className="text-gray-500 capitalize">{section.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 使用方法ヘルプ */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">レポート機能について</h2>
        
        <div className="space-y-3 text-sm">
          <div>
            <h3 className="font-medium">📊 レポートの種類</h3>
            <ul className="mt-1 space-y-1 text-gray-600 ml-4">
              <li>• <strong>サマリー版</strong>: 評価結果の概要と主要な推奨事項</li>
              <li>• <strong>標準版</strong>: 詳細分析と改善提案を含む包括的なレポート</li>
              <li>• <strong>詳細版</strong>: マトリクス計算詳細と履歴データを含む完全版</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium">📋 出力形式</h3>
            <ul className="mt-1 space-y-1 text-gray-600 ml-4">
              <li>• <strong>PDF</strong>: 印刷に適した形式、社外共有に最適</li>
              <li>• <strong>HTML</strong>: Web表示可能、グラフの拡大表示対応</li>
              <li>• <strong>Word</strong>: 編集可能な文書形式、カスタマイズ可能</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium">🎯 活用シーン</h3>
            <ul className="mt-1 space-y-1 text-gray-600 ml-4">
              <li>• 管理者への報告書作成</li>
              <li>• 安全委員会での資料作成</li>
              <li>• 改善計画の立案・共有</li>
              <li>• 定期的な安全評価記録</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}