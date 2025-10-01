/**
 * AI自動選択機能のプロトタイプ
 * 作業内容から適切な評価項目と値を推定する
 */

import { MentalFactorItem } from '@/components/evaluation/MentalFactorDetail'
import { EnvironmentalItem } from '@/components/evaluation/EnvironmentalFactorDetail'

export interface WorkAnalysisInput {
  workName: string
  workDescription?: string
  factoryType?: string
  processType?: string
  workEnvironment?: string
  workerCount?: number
  workHours?: number
  photos?: string[]
}

export interface AIRecommendation {
  factorType: 'physical' | 'mental' | 'environmental' | 'hazard'
  confidence: number // 0-100の信頼度
  recommendations: any[]
  reasoning: string
}

export interface AIAnalysisResult {
  workAnalysis: {
    complexity: 'low' | 'medium' | 'high'
    physicalDemand: 'low' | 'medium' | 'high'
    mentalDemand: 'low' | 'medium' | 'high'
    environmentalRisk: 'low' | 'medium' | 'high'
    hazardLevel: 'low' | 'medium' | 'high'
  }
  recommendations: AIRecommendation[]
  estimatedScore: {
    physical: number
    mental: number
    environmental: number
    hazard: number
    final3K: string
  }
}

class AIAssistantService {
  private static instance: AIAssistantService
  
  // 作業名から推定される要因のマッピング
  private workKeywordMapping = {
    physical: {
      '重量物': { weight: 'high', muscle: 'high' },
      '持ち上げ': { weight: 'high', posture: 'medium' },
      '運搬': { weight: 'medium', muscle: 'medium' },
      '組立': { posture: 'medium', eye: 'medium' },
      '溶接': { posture: 'high', eye: 'high', gear: 'high' },
      '研磨': { posture: 'medium', vibration: 'high', gear: 'medium' },
      'ドライバー': { posture: 'medium', muscle: 'low' },
      '立ち作業': { posture: 'medium' },
      '座り作業': { posture: 'low' },
      'しゃがみ': { posture: 'high' }
    },
    mental: {
      '検査': { concentration: 'high', cognitiveLoad: 'medium' },
      '品質管理': { concentration: 'high', failure: 'medium' },
      '計測': { concentration: 'medium', failure: 'low' },
      '監視': { concentration: 'high', emotionalBurden: 'low' },
      '判定': { cognitiveLoad: 'high', failure: 'medium' },
      '制御': { skillUtilization: 'high', workControl: 'high' },
      '調整': { skillUtilization: 'medium', concentration: 'medium' },
      'プログラミング': { concentration: 'high', cognitiveLoad: 'high' },
      '設計': { concentration: 'high', cognitiveLoad: 'high' }
    },
    environmental: {
      '化学': { chemical: 'high' },
      '溶剤': { chemical: 'high' },
      '塗装': { chemical: 'high', ventilation: 'medium' },
      '騒音': { noise: 'high' },
      '高温': { temperature: 'high' },
      '寒冷': { temperature: 'high' },
      '粉塵': { dust: 'high' },
      '振動': { vibration: 'high' },
      '汚染': { contamination: 'medium' }
    },
    hazard: {
      '機械操作': { machinery: 'medium' },
      'クレーン': { falling: 'high', machinery: 'medium' },
      '高所': { falling: 'high' },
      '電気': { electrical: 'high' },
      '圧力': { pressure: 'medium' },
      '回転': { entrapment: 'medium' },
      '切断': { cutting: 'high' },
      '火気': { fire: 'high' }
    }
  }

  private constructor() {}

  public static getInstance(): AIAssistantService {
    if (!AIAssistantService.instance) {
      AIAssistantService.instance = new AIAssistantService()
    }
    return AIAssistantService.instance
  }

  /**
   * 作業内容を分析してAI推奨を生成
   */
  public async analyzeWork(input: WorkAnalysisInput): Promise<AIAnalysisResult> {
    // 作業名と説明からキーワードを抽出
    const keywords = this.extractKeywords(input.workName, input.workDescription || '')
    
    // 各因子の推定
    const workAnalysis = this.estimateWorkCharacteristics(keywords, input)
    
    // 推奨値を生成
    const recommendations = this.generateRecommendations(keywords, workAnalysis, input)
    
    // スコア推定
    const estimatedScore = this.estimateScores(workAnalysis, recommendations)

    return {
      workAnalysis,
      recommendations,
      estimatedScore
    }
  }

  /**
   * 精神因子の自動設定
   */
  public generateMentalFactorRecommendations(
    input: WorkAnalysisInput
  ): Partial<MentalFactorItem>[] {
    const keywords = this.extractKeywords(input.workName, input.workDescription || '')
    const recommendations: Partial<MentalFactorItem>[] = []

    // 作業複雑度に基づく推定
    if (keywords.includes('検査') || keywords.includes('品質')) {
      recommendations.push({
        id: '2',
        isChecked: true,
        selectValue: '高度な集中を要する',
        inputValue: '60'
      })
      recommendations.push({
        id: '1',
        isChecked: true,
        selectValue: '時々ある',
        inputValue: '30'
      })
    }

    if (keywords.includes('監視') || keywords.includes('制御')) {
      recommendations.push({
        id: '3',
        isChecked: true,
        selectValue: '比較的ある',
        inputValue: '40'
      })
      recommendations.push({
        id: '6',
        isChecked: true,
        selectValue: 'やや高い',
        inputValue: '25'
      })
    }

    if (keywords.includes('判定') || keywords.includes('決定')) {
      recommendations.push({
        id: '4',
        isChecked: true,
        selectValue: 'どちらとも言えない',
        inputValue: '30'
      })
    }

    return recommendations
  }

  /**
   * 環境因子の自動設定
   */
  public generateEnvironmentalFactorRecommendations(
    input: WorkAnalysisInput
  ): Partial<EnvironmentalItem>[] {
    const keywords = this.extractKeywords(input.workName, input.workDescription || '')
    const recommendations: Partial<EnvironmentalItem>[] = []

    // 化学物質関連
    if (keywords.includes('化学') || keywords.includes('溶剤') || keywords.includes('塗装')) {
      recommendations.push({
        id: '1',
        isChecked: true,
        measuredValue: this.estimateChemicalConcentration(keywords),
        exposureDuration: '40%'
      })
    }

    // 騒音関連
    if (keywords.includes('機械') || keywords.includes('プレス') || keywords.includes('研磨')) {
      recommendations.push({
        id: '7',
        isChecked: true,
        measuredValue: this.estimateNoiseLevel(keywords),
        exposureDuration: '60%'
      })
    }

    // 温度関連
    if (keywords.includes('高温') || keywords.includes('炉') || keywords.includes('溶解')) {
      recommendations.push({
        id: '5',
        isChecked: true,
        measuredValue: '32',
        exposureDuration: '40%'
      })
    }

    // 粉塵関連
    if (keywords.includes('研磨') || keywords.includes('切断') || keywords.includes('粉砕')) {
      recommendations.push({
        id: '4',
        isChecked: true,
        measuredValue: '3.0',
        exposureDuration: '30%'
      })
    }

    return recommendations
  }

  /**
   * 音声入力からの推定（プロトタイプ）
   */
  public async processVoiceInput(audioBlob: Blob): Promise<{
    transcription: string
    analysis: AIAnalysisResult
  }> {
    // 実際の実装では音声認識APIを使用
    // ここではダミーデータを返す
    const transcription = "重量物の運搬作業で、10キロの部品を1日に50回程度持ち上げます。騒音のある環境で、安全帽とグローブを着用しています。"
    
    const analysis = await this.analyzeWork({
      workName: '重量物運搬',
      workDescription: transcription,
      workHours: 8
    })

    return { transcription, analysis }
  }

  // プライベートヘルパーメソッド

  private extractKeywords(workName: string, description: string): string[] {
    const text = `${workName} ${description}`.toLowerCase()
    const keywords: string[] = []

    // 物理的要因のキーワード
    Object.keys(this.workKeywordMapping.physical).forEach(keyword => {
      if (text.includes(keyword)) keywords.push(keyword)
    })

    // 精神的要因のキーワード
    Object.keys(this.workKeywordMapping.mental).forEach(keyword => {
      if (text.includes(keyword)) keywords.push(keyword)
    })

    // 環境要因のキーワード
    Object.keys(this.workKeywordMapping.environmental).forEach(keyword => {
      if (text.includes(keyword)) keywords.push(keyword)
    })

    // 危険要因のキーワード
    Object.keys(this.workKeywordMapping.hazard).forEach(keyword => {
      if (text.includes(keyword)) keywords.push(keyword)
    })

    return keywords
  }

  private estimateWorkCharacteristics(keywords: string[], input: WorkAnalysisInput) {
    const complexity: 'low' | 'medium' | 'high' = 'medium'
    let physicalDemand: 'low' | 'medium' | 'high' = 'low'
    let mentalDemand: 'low' | 'medium' | 'high' = 'low'
    let environmentalRisk: 'low' | 'medium' | 'high' = 'low'
    let hazardLevel: 'low' | 'medium' | 'high' = 'low'

    // キーワードベースの推定
    if (keywords.includes('重量物') || keywords.includes('溶接')) physicalDemand = 'high'
    if (keywords.includes('検査') || keywords.includes('品質管理')) mentalDemand = 'high'
    if (keywords.includes('化学') || keywords.includes('高温')) environmentalRisk = 'high'
    if (keywords.includes('高所') || keywords.includes('電気')) hazardLevel = 'high'

    // 作業時間による補正
    if (input.workHours && input.workHours > 8) {
      if (physicalDemand === 'low') physicalDemand = 'high'
      if (mentalDemand === 'low') mentalDemand = 'high'
    }

    return { complexity, physicalDemand, mentalDemand, environmentalRisk, hazardLevel }
  }

  private generateRecommendations(
    keywords: string[], 
    analysis: any, 
    input: WorkAnalysisInput
  ): AIRecommendation[] {
    const recommendations: AIRecommendation[] = []

    // 物理因子の推奨
    if (analysis.physicalDemand !== 'low') {
      recommendations.push({
        factorType: 'physical',
        confidence: 75,
        recommendations: this.generatePhysicalRecommendations(keywords, analysis),
        reasoning: `作業内容から物理的負荷が${analysis.physicalDemand}レベルと推定されます`
      })
    }

    // 精神因子の推奨
    if (analysis.mentalDemand !== 'low') {
      recommendations.push({
        factorType: 'mental',
        confidence: 70,
        recommendations: this.generateMentalFactorRecommendations(input),
        reasoning: `作業の複雑さから精神的負荷が${analysis.mentalDemand}レベルと推定されます`
      })
    }

    // 環境因子の推奨
    if (analysis.environmentalRisk !== 'low') {
      recommendations.push({
        factorType: 'environmental',
        confidence: 80,
        recommendations: this.generateEnvironmentalFactorRecommendations(input),
        reasoning: `作業環境から環境リスクが${analysis.environmentalRisk}レベルと推定されます`
      })
    }

    return recommendations
  }

  private generatePhysicalRecommendations(keywords: string[], analysis: any): any[] {
    // 物理因子の推奨値生成ロジック（省略）
    return []
  }

  private estimateScores(analysis: any, recommendations: AIRecommendation[]) {
    // スコア推定ロジック
    const physical = analysis.physicalDemand === 'high' ? 6 : analysis.physicalDemand === 'medium' ? 3 : 1
    const mental = analysis.mentalDemand === 'high' ? 5 : analysis.mentalDemand === 'medium' ? 3 : 1  
    const environmental = analysis.environmentalRisk === 'high' ? 7 : analysis.environmentalRisk === 'medium' ? 4 : 1
    const hazard = analysis.hazardLevel === 'high' ? 8 : analysis.hazardLevel === 'medium' ? 4 : 1

    const finalScore = Math.max(physical, mental, environmental, hazard)
    let final3K: string
    if (finalScore >= 7) final3K = 'A'
    else if (finalScore >= 4) final3K = 'B'
    else if (finalScore >= 2) final3K = 'C'
    else final3K = 'D'

    return { physical, mental, environmental, hazard, final3K }
  }

  private estimateChemicalConcentration(keywords: string[]): string {
    if (keywords.includes('塗装')) return '15.0'
    if (keywords.includes('溶剤')) return '8.0'
    return '5.0'
  }

  private estimateNoiseLevel(keywords: string[]): string {
    if (keywords.includes('プレス')) return '95'
    if (keywords.includes('研磨')) return '88'
    if (keywords.includes('機械')) return '82'
    return '75'
  }
}

// シングルトンインスタンスをエクスポート
export const aiAssistant = AIAssistantService.getInstance()

// 便利な関数をエクスポート
export const analyzeWorkWithAI = async (input: WorkAnalysisInput): Promise<AIAnalysisResult> => {
  return await aiAssistant.analyzeWork(input)
}

export const generateMentalRecommendations = (input: WorkAnalysisInput): Partial<MentalFactorItem>[] => {
  return aiAssistant.generateMentalFactorRecommendations(input)
}

export const generateEnvironmentalRecommendations = (input: WorkAnalysisInput): Partial<EnvironmentalItem>[] => {
  return aiAssistant.generateEnvironmentalFactorRecommendations(input)
}