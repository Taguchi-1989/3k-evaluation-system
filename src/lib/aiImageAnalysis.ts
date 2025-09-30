/**
 * AI画像解析機能
 * 作業写真から自動的に作業内容と危険要因を識別
 */

export interface ImageAnalysisResult {
  detectedObjects: DetectedObject[]
  workType: string
  riskFactors: RiskFactor[]
  postureAnalysis: PostureAnalysis
  environmentalFactors: EnvironmentalFactor[]
  confidence: number
}

export interface DetectedObject {
  name: string
  confidence: number
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface RiskFactor {
  type: 'physical' | 'chemical' | 'ergonomic' | 'safety'
  description: string
  severity: 'low' | 'medium' | 'high'
  confidence: number
}

export interface PostureAnalysis {
  bodyPosition: 'standing' | 'sitting' | 'bending' | 'kneeling' | 'unknown'
  armPosition: 'neutral' | 'overhead' | 'extended' | 'unknown'
  spinePosition: 'straight' | 'bent' | 'twisted' | 'unknown'
  legPosition: 'normal' | 'wide' | 'crossed' | 'unknown'
  riskLevel: number // 1-10
}

export interface EnvironmentalFactor {
  type: 'lighting' | 'noise' | 'temperature' | 'cleanliness' | 'space'
  level: 'good' | 'fair' | 'poor'
  description: string
}

class AIImageAnalysisService {
  private static instance: AIImageAnalysisService

  public static getInstance(): AIImageAnalysisService {
    if (!AIImageAnalysisService.instance) {
      AIImageAnalysisService.instance = new AIImageAnalysisService()
    }
    return AIImageAnalysisService.instance
  }

  // オブジェクト検出のマッピング
  private objectMappings = {
    'person': { workRelevant: true, riskLevel: 0 },
    'tool': { workRelevant: true, riskLevel: 2 },
    'machine': { workRelevant: true, riskLevel: 4 },
    'computer': { workRelevant: true, riskLevel: 1 },
    'chair': { workRelevant: true, riskLevel: 1 },
    'ladder': { workRelevant: true, riskLevel: 7 },
    'chemical': { workRelevant: true, riskLevel: 8 },
    'fire': { workRelevant: true, riskLevel: 9 },
    'sharp_object': { workRelevant: true, riskLevel: 6 }
  }

  // 作業タイプの推定
  private workTypePatterns = [
    { keywords: ['computer', 'desk', 'chair'], type: 'デスクワーク', confidence: 0.8 },
    { keywords: ['machine', 'tool', 'factory'], type: '機械作業', confidence: 0.9 },
    { keywords: ['ladder', 'height', 'construction'], type: '高所作業', confidence: 0.9 },
    { keywords: ['chemical', 'laboratory', 'container'], type: '化学作業', confidence: 0.85 },
    { keywords: ['person', 'movement', 'lifting'], type: '運搬作業', confidence: 0.7 }
  ]

  /**
   * 画像を分析してAI結果を返す（デモ実装）
   */
  async analyzeImage(imageFile: File): Promise<ImageAnalysisResult> {
    // 実際の実装では、TensorFlow.js やクラウドAPIを使用
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResult = this.generateMockAnalysis(imageFile.name)
        resolve(mockResult)
      }, 2000) // 2秒の分析時間をシミュレート
    })
  }

  /**
   * 複数画像の一括分析
   */
  async analyzeMutlipleImages(imageFiles: File[]): Promise<ImageAnalysisResult[]> {
    const results = await Promise.all(
      imageFiles.map(file => this.analyzeImage(file))
    )
    return results
  }

  /**
   * Base64画像データの分析
   */
  async analyzeImageFromBase64(base64Data: string): Promise<ImageAnalysisResult> {
    // Base64からファイル情報を抽出
    const fileName = 'uploaded_image.jpg'
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResult = this.generateMockAnalysis(fileName)
        resolve(mockResult)
      }, 2000)
    })
  }

  /**
   * デモ用のモック分析結果生成
   */
  private generateMockAnalysis(fileName: string): ImageAnalysisResult {
    const fileNameLower = fileName.toLowerCase()
    
    // ファイル名から作業タイプを推定
    let detectedWorkType = 'その他の作業'
    let confidence = 0.6
    
    if (fileNameLower.includes('desk') || fileNameLower.includes('office')) {
      detectedWorkType = 'デスクワーク'
      confidence = 0.85
    } else if (fileNameLower.includes('machine') || fileNameLower.includes('factory')) {
      detectedWorkType = '機械作業'
      confidence = 0.9
    } else if (fileNameLower.includes('construction') || fileNameLower.includes('build')) {
      detectedWorkType = '建設作業'
      confidence = 0.8
    }

    const mockObjects: DetectedObject[] = [
      { name: 'person', confidence: 0.95, boundingBox: { x: 100, y: 50, width: 200, height: 400 } },
      { name: 'tool', confidence: 0.82, boundingBox: { x: 250, y: 200, width: 80, height: 120 } },
      { name: 'machine', confidence: 0.76, boundingBox: { x: 400, y: 100, width: 300, height: 250 } }
    ]

    const mockRiskFactors: RiskFactor[] = [
      {
        type: 'physical',
        description: '重量物の取り扱いが検出されました',
        severity: 'medium',
        confidence: 0.75
      },
      {
        type: 'ergonomic',
        description: '不適切な姿勢での作業が見られます',
        severity: 'high',
        confidence: 0.82
      }
    ]

    const mockPosture: PostureAnalysis = {
      bodyPosition: 'standing',
      armPosition: 'extended',
      spinePosition: 'bent',
      legPosition: 'normal',
      riskLevel: 6
    }

    const mockEnvironmental: EnvironmentalFactor[] = [
      {
        type: 'lighting',
        level: 'fair',
        description: '照明が若干不足している可能性があります'
      },
      {
        type: 'space',
        level: 'good',
        description: '作業スペースは適切に確保されています'
      }
    ]

    return {
      detectedObjects: mockObjects,
      workType: detectedWorkType,
      riskFactors: mockRiskFactors,
      postureAnalysis: mockPosture,
      environmentalFactors: mockEnvironmental,
      confidence
    }
  }

  /**
   * 分析結果から3K評価用のデータを生成
   */
  generateEvaluationSuggestions(analysisResult: ImageAnalysisResult) {
    const suggestions = {
      physical: this.generatePhysicalSuggestions(analysisResult),
      mental: this.generateMentalSuggestions(analysisResult),
      environmental: this.generateEnvironmentalSuggestions(analysisResult),
      hazard: this.generateHazardSuggestions(analysisResult)
    }

    return suggestions
  }

  private generatePhysicalSuggestions(analysis: ImageAnalysisResult) {
    const suggestions: Record<string, any> = {}
    
    // 姿勢分析から物理的負荷を推定
    if (analysis.postureAnalysis.riskLevel >= 6) {
      suggestions.posture = {
        type: 'poor_posture',
        severity: 'high',
        recommendation: '姿勢改善が必要です'
      }
    }

    // 検出されたオブジェクトから重量負荷を推定
    const heavyObjects = analysis.detectedObjects.filter(obj => 
      ['machine', 'tool', 'container'].includes(obj.name)
    )
    
    if (heavyObjects.length > 0) {
      suggestions.weight = {
        estimated: true,
        recommendation: '重量物取扱いの評価が推奨されます'
      }
    }

    return suggestions
  }

  private generateMentalSuggestions(analysis: ImageAnalysisResult) {
    const suggestions: Record<string, any> = {}
    
    // 作業タイプから精神的負荷を推定
    if (analysis.workType.includes('デスクワーク')) {
      suggestions.concentration = {
        level: 'high',
        duration: '60%',
        recommendation: '長時間の集中作業が検出されました'
      }
    }

    if (analysis.workType.includes('機械作業')) {
      suggestions.stress = {
        level: 'medium',
        source: 'machinery_operation',
        recommendation: '機械操作による精神的負荷があります'
      }
    }

    return suggestions
  }

  private generateEnvironmentalSuggestions(analysis: ImageAnalysisResult) {
    const suggestions: Record<string, any> = {}
    
    analysis.environmentalFactors.forEach(factor => {
      if (factor.level === 'poor') {
        suggestions[factor.type] = {
          level: 'poor',
          recommendation: factor.description,
          action_required: true
        }
      }
    })

    return suggestions
  }

  private generateHazardSuggestions(analysis: ImageAnalysisResult) {
    const suggestions: Record<string, any> = {}
    
    analysis.riskFactors.forEach(risk => {
      if (risk.severity === 'high') {
        suggestions[risk.type] = {
          severity: risk.severity,
          description: risk.description,
          immediate_action: true
        }
      }
    })

    return suggestions
  }
}

export const aiImageAnalysis = AIImageAnalysisService.getInstance()