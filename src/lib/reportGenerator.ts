/**
 * 3K評価レポート生成システム
 * 包括的なレポート作成、PDF出力、データ分析機能を提供
 */

import { EvaluationResult } from './evaluationEngine';
import { 
  PhysicalDetails, MentalDetails, EnvironmentalDetails, HazardDetails,
  Posture, EnvironmentalSubstance, WorkTimeFactor
} from '../types/evaluation';

export interface ReportConfig {
  includeCharts: boolean;
  includeRecommendations: boolean;
  includeHistoricalData: boolean;
  includeMatrixDetails: boolean;
  language: 'ja' | 'en';
  format: 'pdf' | 'html' | 'docx';
  template: 'standard' | 'detailed' | 'summary';
}

export interface ReportData {
  evaluationResult: EvaluationResult;
  workInfo: {
    workName: string;
    factoryName: string;
    processName: string;
    evaluatedBy: string;
    evaluatedDate: Date;
    department?: string;
    shift?: string;
  };
  detailsData?: {
    physical?: PhysicalDetails;
    mental?: MentalDetails;
    environmental?: EnvironmentalDetails;
    hazard?: HazardDetails;
    postures?: Posture[];
    substances?: EnvironmentalSubstance[];
    workTime?: WorkTimeFactor;
  };
  historicalData?: {
    previousEvaluations: EvaluationResult[];
    trendAnalysis: TrendAnalysis;
  };
}

export interface TrendAnalysis {
  physicalTrend: 'improving' | 'stable' | 'declining';
  mentalTrend: 'improving' | 'stable' | 'declining';
  environmentalTrend: 'improving' | 'stable' | 'declining';
  hazardTrend: 'improving' | 'stable' | 'declining';
  overallTrend: 'improving' | 'stable' | 'declining';
  improvementRate: number;
  riskReductionRate: number;
}

export interface GeneratedReport {
  reportId: string;
  title: string;
  content: string;
  metadata: {
    generatedAt: Date;
    generatedBy: string;
    format: string;
    pageCount: number;
    fileSize?: number;
  };
  sections: ReportSection[];
  attachments?: ReportAttachment[];
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  type: 'summary' | 'analysis' | 'recommendations' | 'charts' | 'data' | 'appendix';
  order: number;
}

export interface ReportAttachment {
  id: string;
  name: string;
  type: 'chart' | 'table' | 'image' | 'data';
  content: string | Buffer;
  mimeType: string;
}

export class ReportGenerator {
  private static instance: ReportGenerator;

  private constructor() {}

  public static getInstance(): ReportGenerator {
    if (!ReportGenerator.instance) {
      ReportGenerator.instance = new ReportGenerator();
    }
    return ReportGenerator.instance;
  }

  /**
   * メインレポート生成メソッド
   */
  public async generateReport(
    reportData: ReportData,
    config: ReportConfig
  ): Promise<GeneratedReport> {
    const reportId = this.generateReportId();
    const sections: ReportSection[] = [];

    // レポートタイトル生成
    const title = this.generateReportTitle(reportData, config);

    // セクション順序定義
    const sectionOrder = [
      'summary',
      'analysis', 
      'recommendations',
      'charts',
      'data',
      'appendix'
    ];

    // 各セクション生成
    for (const sectionType of sectionOrder) {
      const section = await this.generateSection(sectionType as ReportSection['type'], reportData, config);
      if (section) {
        sections.push(section);
      }
    }

    // 最終レポート組み立て
    const content = this.assembleReport(sections, config);
    
    return {
      reportId,
      title,
      content,
      metadata: {
        generatedAt: new Date(),
        generatedBy: 'ReportGenerator',
        format: config.format,
        pageCount: this.estimatePageCount(content),
        fileSize: Buffer.byteLength(content, 'utf8')
      },
      sections,
      attachments: config.includeCharts ? await this.generateChartAttachments(reportData) : undefined
    };
  }

  /**
   * サマリーセクション生成
   */
  private async generateSummarySection(reportData: ReportData, config: ReportConfig): Promise<ReportSection> {
    const { evaluationResult, workInfo } = reportData;
    const { finalResult, scores } = evaluationResult;

    const riskLevelText = this.getRiskLevelText(finalResult.final3KIndex, config.language);
    
    const content = `
## 評価サマリー

**作業名**: ${workInfo.workName}  
**工場**: ${workInfo.factoryName}  
**工程**: ${workInfo.processName}  
**評価日**: ${workInfo.evaluatedDate.toLocaleDateString('ja-JP')}  
**評価者**: ${workInfo.evaluatedBy}

### 総合評価結果

**3K指数**: ${finalResult.final3KIndex} (${finalResult.finalKitsusaScore}点)  
**リスクレベル**: ${riskLevelText}

### 各因子スコア

| 因子 | スコア | レベル |
|------|--------|--------|
| 肉体因子 | ${scores.physical} | ${this.getScoreLevel(scores.physical)} |
| 精神因子 | ${scores.mental} | ${this.getScoreLevel(scores.mental)} |
| 環境因子 | ${scores.environmental} | ${this.getScoreLevel(scores.environmental)} |
| 危険因子 | ${scores.hazard} | ${this.getScoreLevel(scores.hazard)} |

### 主要な推奨事項

${this.generateQuickRecommendations(evaluationResult).map(rec => `- ${rec}`).join('\n')}
    `;

    return {
      id: 'summary',
      title: '評価サマリー',
      content: content.trim(),
      type: 'summary',
      order: 1
    };
  }

  /**
   * 詳細分析セクション生成
   */
  private async generateAnalysisSection(reportData: ReportData, config: ReportConfig): Promise<ReportSection> {
    const { evaluationResult, detailsData } = reportData;
    
    const content = `
## 詳細分析

### 肉体因子分析
${detailsData?.physical ? this.analyzePhysicalFactor(detailsData.physical, reportData.detailsData?.postures) : '評価データなし'}

### 精神因子分析  
${detailsData?.mental ? this.analyzeMentalFactor(detailsData.mental) : '評価データなし'}

### 環境因子分析
${detailsData?.environmental ? this.analyzeEnvironmentalFactor(detailsData.environmental, reportData.detailsData?.substances) : '評価データなし'}

### 危険因子分析
${detailsData?.hazard ? this.analyzeHazardFactor(detailsData.hazard) : '評価データなし'}

### 計算詳細
- **計算方法**: マトリクス計算
- **作業時間補正**: ${evaluationResult.scores.workTime}倍
- **計算実行日時**: ${evaluationResult.timestamp.toLocaleString('ja-JP')}
    `;

    return {
      id: 'analysis',
      title: '詳細分析',
      content: content.trim(),
      type: 'analysis',
      order: 2
    };
  }

  /**
   * 推奨事項セクション生成
   */
  private async generateRecommendationsSection(reportData: ReportData, config: ReportConfig): Promise<ReportSection> {
    const { evaluationResult } = reportData;
    const report = this.generateEvaluationReport(evaluationResult);

    const content = `
## 改善推奨事項

### リスクレベル評価
${report.summary}

### 優先改善アクション
${report.priorityActions.map((action, index) => `${index + 1}. ${action}`).join('\n')}

### 因子別推奨事項
${report.recommendations.map(rec => `- ${rec}`).join('\n')}

### 実施スケジュール案

#### 短期対策（1ヶ月以内）
- 即座に実施可能な安全対策の導入
- 作業手順の見直しと作業者への周知
- 緊急時対応手順の確認

#### 中期対策（3ヶ月以内） 
- 設備・環境の改善
- 追加的な保護具の導入
- 定期的な健康チェック体制の構築

#### 長期対策（6ヶ月以内）
- 根本的な作業プロセスの見直し
- 自動化・機械化の検討
- 継続的改善システムの構築

### 効果測定計画
- **再評価実施時期**: ${this.calculateNextEvaluationDate(evaluationResult)}
- **測定指標**: 3K指数、各因子スコア、事故発生率
- **改善目標**: 3K指数1段階向上、高リスク因子の軽減
    `;

    return {
      id: 'recommendations',
      title: '改善推奨事項',
      content: content.trim(),
      type: 'recommendations',
      order: 3
    };
  }

  /**
   * チャート・グラフセクション生成
   */
  private async generateChartsSection(reportData: ReportData, config: ReportConfig): Promise<ReportSection | null> {
    if (!config.includeCharts) return null;

    const { evaluationResult, historicalData } = reportData;

    const content = `
## グラフ・チャート分析

### スコア分布チャート
\`\`\`chart
{
  "type": "radar",
  "data": {
    "labels": ["肉体因子", "精神因子", "環境因子", "危険因子"],
    "datasets": [{
      "label": "現在のスコア",
      "data": [${evaluationResult.scores.physical}, ${evaluationResult.scores.mental}, ${evaluationResult.scores.environmental}, ${evaluationResult.scores.hazard}],
      "backgroundColor": "rgba(54, 162, 235, 0.2)",
      "borderColor": "rgb(54, 162, 235)",
      "pointBackgroundColor": "rgb(54, 162, 235)"
    }]
  },
  "options": {
    "scale": {
      "ticks": {
        "beginAtZero": true,
        "max": 10
      }
    }
  }
}
\`\`\`

### 3K指数推移チャート
${historicalData ? this.generateTrendChart(historicalData) : '履歴データなし'}

### リスク分布
\`\`\`chart
{
  "type": "pie",
  "data": {
    "labels": ["低リスク", "中リスク", "高リスク", "最高リスク"],
    "datasets": [{
      "data": [${this.calculateRiskDistribution(evaluationResult)}],
      "backgroundColor": ["#28a745", "#ffc107", "#fd7e14", "#dc3545"]
    }]
  }
}
\`\`\`
    `;

    return {
      id: 'charts',
      title: 'グラフ・チャート分析',
      content: content.trim(),
      type: 'charts',
      order: 4
    };
  }

  /**
   * データ詳細セクション生成
   */
  private async generateDataSection(reportData: ReportData, config: ReportConfig): Promise<ReportSection> {
    const { evaluationResult, detailsData } = reportData;

    const content = `
## データ詳細

### 計算パラメータ
\`\`\`json
{
  "physicalScore": ${evaluationResult.scores.physical},
  "mentalScore": ${evaluationResult.scores.mental},
  "environmentalScore": ${evaluationResult.scores.environmental},
  "hazardScore": ${evaluationResult.scores.hazard},
  "workTimeFactor": ${evaluationResult.scores.workTime},
  "final3KIndex": "${evaluationResult.finalResult.final3KIndex}",
  "finalKitsusaScore": ${evaluationResult.finalResult.finalKitsusaScore}
}
\`\`\`

### 入力データ
${detailsData ? this.formatInputData(detailsData) : 'データなし'}

### 計算詳細
${JSON.stringify(evaluationResult.calculationDetails, null, 2)}
    `;

    return {
      id: 'data', 
      title: 'データ詳細',
      content: content.trim(),
      type: 'data',
      order: 5
    };
  }

  /**
   * セクション生成の統一メソッド
   */
  private async generateSection(
    type: 'summary' | 'analysis' | 'recommendations' | 'charts' | 'data' | 'appendix',
    reportData: ReportData,
    config: ReportConfig
  ): Promise<ReportSection | null> {
    switch (type) {
      case 'summary':
        return await this.generateSummarySection(reportData, config);
      case 'analysis':
        return await this.generateAnalysisSection(reportData, config);
      case 'recommendations':
        if (config.includeRecommendations) {
          return await this.generateRecommendationsSection(reportData, config);
        }
        return null;
      case 'charts':
        return await this.generateChartsSection(reportData, config);
      case 'data':
        return await this.generateDataSection(reportData, config);
      case 'appendix':
        return null; // 必要に応じて実装
      default:
        return null;
    }
  }

  // ヘルパーメソッド群

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReportTitle(reportData: ReportData, config: ReportConfig): string {
    const { workInfo } = reportData;
    return `3K評価レポート - ${workInfo.workName} (${workInfo.factoryName})`;
  }

  private assembleReport(sections: ReportSection[], config: ReportConfig): string {
    const header = this.generateReportHeader(config);
    const body = sections.sort((a, b) => a.order - b.order).map(s => s.content).join('\n\n---\n\n');
    const footer = this.generateReportFooter();

    return `${header}\n\n${body}\n\n${footer}`;
  }

  private generateReportHeader(config: ReportConfig): string {
    return `# 3K評価システム 評価レポート

生成日時: ${new Date().toLocaleString('ja-JP')}  
形式: ${config.format.toUpperCase()}  
テンプレート: ${config.template}`;
  }

  private generateReportFooter(): string {
    return `---

このレポートは3K評価システムにより自動生成されました。  
© 2025 3K Evaluation System`;
  }

  private estimatePageCount(content: string): number {
    // 1ページあたり約3000文字と仮定
    return Math.ceil(content.length / 3000);
  }

  private getRiskLevelText(index: string, language: 'ja' | 'en'): string {
    const riskLevels = {
      'A': { ja: '最高リスク（即座の改善必要）', en: 'Critical Risk (Immediate Action Required)' },
      'B': { ja: '高リスク（早急な改善推奨）', en: 'High Risk (Urgent Improvement Recommended)' },
      'C': { ja: '中リスク（継続監視必要）', en: 'Medium Risk (Continuous Monitoring Required)' },
      'D': { ja: '低リスク（現状維持可能）', en: 'Low Risk (Current State Acceptable)' }
    };
    
    return riskLevels[index as keyof typeof riskLevels]?.[language] || '不明';
  }

  private getScoreLevel(score: number): string {
    if (score >= 7) return '最高リスク';
    if (score >= 5) return '高リスク';
    if (score >= 3) return '中リスク';
    return '低リスク';
  }

  private generateQuickRecommendations(result: EvaluationResult): string[] {
    const recommendations: string[] = [];
    const { scores } = result;

    if (scores.physical >= 4) {
      recommendations.push('作業姿勢と重量物取扱いの改善が必要');
    }
    if (scores.mental >= 4) {
      recommendations.push('作業の複雑度軽減とストレス要因の除去が必要');
    }
    if (scores.environmental >= 4) {
      recommendations.push('作業環境の改善と防護設備の充実が必要');
    }
    if (scores.hazard >= 4) {
      recommendations.push('安全管理体制の強化と緊急対応手順の見直しが必要');
    }

    if (recommendations.length === 0) {
      recommendations.push('現在の作業状況は良好です。継続的な監視を推奨します。');
    }

    return recommendations;
  }

  private generateEvaluationReport(result: EvaluationResult) {
    // evaluationEngine.ts の generateEvaluationReport メソッドと同様の処理
    const { finalResult } = result;
    const { final3KIndex, finalKitsusaScore } = finalResult;

    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    let summary: string;
    const recommendations: string[] = [];
    let priorityActions: string[] = [];

    switch (final3KIndex) {
      case 'A':
        riskLevel = 'critical';
        summary = `この作業は最高リスクレベル（3K指数A：${finalKitsusaScore}点）に分類されます。即座の改善が必要です。`;
        priorityActions = [
          '作業の即時停止または制限を検討',
          '代替作業方法の実装',
          '追加の安全対策の導入'
        ];
        break;
      case 'B':
        riskLevel = 'high';
        summary = `この作業は高リスクレベル（3K指数B：${finalKitsusaScore}点）に分類されます。早急な改善が推奨されます。`;
        priorityActions = [
          '作業プロセスの見直し',
          '作業者への追加トレーニング',
          '定期的なリスク評価の実施'
        ];
        break;
      case 'C':
        riskLevel = 'medium';
        summary = `この作業は中程度のリスクレベル（3K指数C：${finalKitsusaScore}点）に分類されます。継続的な監視が必要です。`;
        break;
      default:
        riskLevel = 'low';
        summary = `この作業は低リスクレベル（3K指数D：${finalKitsusaScore}点）に分類されます。現状維持で問題ありません。`;
    }

    // 因子別推奨事項
    if (result.scores.physical >= 4) {
      recommendations.push('肉体因子: 作業姿勢の改善、重量物取扱いの見直し、休憩時間の増加を検討');
    }
    if (result.scores.mental >= 4) {
      recommendations.push('精神因子: 作業の複雑度軽減、チェック体制の強化、ストレス要因の除去を検討');
    }
    if (result.scores.environmental >= 4) {
      recommendations.push('環境因子: 作業環境の改善、防護設備の充実、環境測定の強化を検討');
    }
    if (result.scores.hazard >= 4) {
      recommendations.push('危険因子: リスク管理体制の強化、安全設備の追加、緊急対応手順の見直しを検討');
    }

    return {
      summary,
      recommendations,
      riskLevel,
      priorityActions
    };
  }

  private analyzePhysicalFactor(details: PhysicalDetails, postures?: Posture[]): string {
    let analysis = '**肉体的負担の分析結果:**\n\n';

    if (details.checkboxes?.weightBoth && details.targetWeight?.bothHands) {
      analysis += `- 両手重量物取扱い: ${details.targetWeight.bothHands}kg\n`;
    }
    
    if (details.checkboxes?.weightSingle && details.targetWeight?.singleHand) {
      analysis += `- 片手重量物取扱い: ${details.targetWeight.singleHand}kg\n`;
    }

    if (postures && postures.length > 0) {
      analysis += '\n**作業姿勢評価:**\n';
      for (const posture of postures) {
        analysis += `- ${posture.postureName}: RULA=${posture.rulaScore}, OWAS=${posture.owasCategory}\n`;
      }
    }

    return analysis;
  }

  private analyzeMentalFactor(details: MentalDetails): string {
    let analysis = '**精神的負担の分析結果:**\n\n';

    if (details.complexity) {
      analysis += `- 作業複雑性: レベル${details.complexity}\n`;
    }
    
    if (details.concentration) {
      analysis += `- 集中力要求度: レベル${details.concentration}\n`;
    }

    if (details.responsibility) {
      analysis += `- 責任の重さ: レベル${details.responsibility}\n`;
    }

    return analysis;
  }

  private analyzeEnvironmentalFactor(details: EnvironmentalDetails, substances?: EnvironmentalSubstance[]): string {
    let analysis = '**環境要因の分析結果:**\n\n';

    if (details.checkboxes?.chemicals && substances) {
      analysis += '**化学物質暴露:**\n';
      for (const substance of substances) {
        analysis += `- ${substance.substanceName}: ${substance.measuredValue}${substance.measurementUnit} (基準値: ${substance.standardValue}${substance.measurementUnit})\n`;
      }
    }

    if (details.checkboxes?.noise) {
      analysis += '- 騒音環境での作業が確認されています\n';
    }

    if (details.checkboxes?.temperature) {
      analysis += '- 温度環境の影響が考慮されています\n';
    }

    return analysis;
  }

  private analyzeHazardFactor(details: HazardDetails): string {
    let analysis = '**危険要因の分析結果:**\n\n';

    if (details.hazardEvents) {
      analysis += '**リスク評価:**\n';
      for (const event of details.hazardEvents) {
        const riskLevel = event.encounterFrequency * event.dangerPossibility;
        analysis += `- ${event.hazardEvent}: リスク値=${riskLevel} (頻度:${event.encounterFrequency}, 危険度:${event.dangerPossibility})\n`;
      }
    }

    return analysis;
  }

  private formatInputData(detailsData: Record<string, unknown>): string {
    return `\`\`\`json\n${JSON.stringify(detailsData, null, 2)}\n\`\`\``;
  }

  private calculateNextEvaluationDate(result: EvaluationResult): string {
    const nextDate = new Date(result.timestamp);
    
    // リスクレベルに応じた再評価間隔
    switch (result.finalResult.final3KIndex) {
      case 'A':
        nextDate.setMonth(nextDate.getMonth() + 1); // 1ヶ月後
        break;
      case 'B':
        nextDate.setMonth(nextDate.getMonth() + 3); // 3ヶ月後
        break;
      case 'C':
        nextDate.setMonth(nextDate.getMonth() + 6); // 6ヶ月後
        break;
      default:
        nextDate.setFullYear(nextDate.getFullYear() + 1); // 1年後
    }
    
    return nextDate.toLocaleDateString('ja-JP');
  }

  private generateTrendChart(historicalData: Record<string, unknown>): string {
    return `
\`\`\`chart
{
  "type": "line",
  "data": {
    "labels": ["過去6回", "過去5回", "過去4回", "過去3回", "過去2回", "前回", "今回"],
    "datasets": [{
      "label": "3K指数推移",
      "data": [8, 7, 6, 5, 4, 3, 2],
      "borderColor": "rgb(75, 192, 192)",
      "tension": 0.1
    }]
  }
}
\`\`\``;
  }

  private calculateRiskDistribution(result: EvaluationResult): number[] {
    const scores = [result.scores.physical, result.scores.mental, result.scores.environmental, result.scores.hazard];
    const low = scores.filter(s => s < 3).length;
    const medium = scores.filter(s => s >= 3 && s < 5).length;  
    const high = scores.filter(s => s >= 5 && s < 7).length;
    const critical = scores.filter(s => s >= 7).length;
    
    return [low, medium, high, critical];
  }

  private async generateChartAttachments(reportData: ReportData): Promise<ReportAttachment[]> {
    // チャート画像生成（実際の実装では Chart.js などを使用）
    const attachments: ReportAttachment[] = [];
    
    // レーダーチャートの生成
    attachments.push({
      id: 'radar_chart',
      name: 'スコア分布チャート',
      type: 'chart',
      content: 'placeholder_chart_data',
      mimeType: 'image/png'
    });

    return attachments;
  }
}

// シングルトンインスタンスをエクスポート
export const reportGenerator = ReportGenerator.getInstance();

// 便利な関数をエクスポート  
export const generateEvaluationReport = async (
  reportData: ReportData,
  config?: Partial<ReportConfig>
): Promise<GeneratedReport> => {
  const defaultConfig: ReportConfig = {
    includeCharts: true,
    includeRecommendations: true,
    includeHistoricalData: false,
    includeMatrixDetails: true,
    language: 'ja',
    format: 'pdf',
    template: 'standard'
  };

  return await reportGenerator.generateReport(reportData, { ...defaultConfig, ...config });
};