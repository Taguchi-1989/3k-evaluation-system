'use client'

import React, { useState, Suspense } from 'react'
import { Header } from '@/components/layout'
import { Card, CardContent, Button, Input } from '@/components/ui'

interface HelpItem {
  id: string
  category: 'basic' | 'evaluation' | 'advanced' | 'troubleshooting'
  title: string
  content: string
  keywords: string[]
}

const helpItems: HelpItem[] = [
  {
    id: '1',
    category: 'basic',
    title: '3K指数評価システムとは',
    content: `3K指数評価システムは、労働環境の「きつい」「汚い」「危険」を数値化して評価するシステムです。
    
主な特徴:
• 肉体因子（RULA法・OWAS法による姿勢評価）
• 精神因子（作業の複雑性や集中度などの精神的負荷）
• 環境因子（温度、湿度、騒音、化学物質等）
• 危険因子（リスクアセスメントによる危険度評価）
• 作業時間（労働時間と疲労度の関係）`,
    keywords: ['3K', '基本', '概要', '評価', '労働環境']
  },
  {
    id: '2',
    category: 'basic',
    title: 'アプリの基本的な使い方',
    content: `1. 新しい評価を作成
   - トップページから「新しい評価を作成」をクリック
   - 作業名、工場名、工程名を入力
   
2. 各因子の評価
   - 肉体因子: 作業姿勢をRULA・OWAS法で評価
   - 精神因子: 作業の複雑性や集中度を評価
   - 環境因子: 温度、騒音、化学物質等を評価
   - 危険因子: リスクレベルを評価
   - 作業時間: 労働時間を入力
   
3. 結果確認と保存
   - 総合評価結果を確認
   - 評価を保存して完了`,
    keywords: ['使い方', '操作', '手順', '評価作成']
  },
  {
    id: '3',
    category: 'evaluation',
    title: '肉体因子の評価方法',
    content: `肉体因子はRULA法とOWAS法を使用して作業姿勢を評価します。

RULA法（Rapid Upper Limb Assessment）:
• 上肢の負担度を1-7のスコアで評価
• 首、体幹、上腕、前腕、手首の角度を測定
• スコア1-2: 低リスク
• スコア3-4: 中リスク（改善検討）
• スコア5-6: 高リスク（早急な改善）
• スコア7: 最高リスク（直ちに改善）

OWAS法（Ovako Working Posture Analysis System）:
• 全身姿勢を4段階で評価
• カテゴリ1: 正常（対策不要）
• カテゴリ2: 軽度（将来的に対策が必要）
• カテゴリ3: 重度（近い将来対策が必要）
• カテゴリ4: 極度（直ちに対策が必要）`,
    keywords: ['肉体因子', 'RULA', 'OWAS', '姿勢評価', '身体負担']
  },
  {
    id: '4',
    category: 'evaluation',
    title: '精神因子の評価方法',
    content: `精神因子は作業の精神的負荷を以下の項目で評価します:

1. 作業の複雑性
   - 単純反復作業から高度な専門判断まで5段階

2. 集中力の要求度
   - 持続的注意力の必要性を5段階で評価

3. 責任の重さ
   - 作業結果への責任度を評価

4. 時間的プレッシャー
   - 時間的制約による負荷を評価

5. コミュニケーション負荷
   - 他者との調整・連携の負担

6. 意思決定の頻度
   - 判断・決定を求められる頻度

各項目を1-5のレベルで評価し、持続時間で補正します。`,
    keywords: ['精神因子', '精神的負荷', '集中力', '責任', 'ストレス']
  },
  {
    id: '5',
    category: 'evaluation',
    title: '環境因子の評価方法',
    content: `環境因子は作業環境の物理的・化学的要因を評価します:

物理的要因:
• 温度・湿度: 快適範囲からの乖離度
• 照度: 作業に適した明るさの確保
• 騒音: 作業に支障をきたすレベル
• 振動: 手腕振動・全身振動の影響

化学的要因:
• 化学物質: 有害物質の暴露レベル
• 粉塵: 呼吸器への影響
• 換気: 空気環境の適切性

各要因について標準値と実測値を比較し、基準からの乖離度と暴露時間を考慮してリスクレベルを算出します。`,
    keywords: ['環境因子', '温度', '騒音', '化学物質', '作業環境']
  },
  {
    id: '6',
    category: 'troubleshooting',
    title: 'よくある問題と解決方法',
    content: `Q. 評価データが保存されません
A. ブラウザのキャッシュをクリアして再度お試しください。

Q. 写真がアップロードできません
A. 対応ファイル形式（JPG, PNG, PDF）で10MB以下のファイルをご使用ください。

Q. 評価結果が正しく計算されません
A. 全ての必須項目が入力されているか確認してください。

Q. ページが正しく表示されません
A. ブラウザを最新バージョンに更新してください。推奨ブラウザ: Chrome, Firefox, Safari, Edge

Q. ダークモードが切り替わりません
A. ページを再読み込みするか、ブラウザの設定を確認してください。`,
    keywords: ['トラブル', '問題', '解決', 'エラー', '不具合']
  },
  {
    id: '7',
    category: 'advanced',
    title: '評価結果の解釈と活用',
    content: `評価結果の見方:

総合スコア:
• A評価（1-2点）: 良好な作業環境
• B評価（3-4点）: 改善検討が必要
• C評価（5-6点）: 早急な改善が必要
• D評価（7点以上）: 直ちに改善が必要

活用方法:
1. 改善優先度の決定
   - 高リスク項目から順次改善
   
2. 改善効果の測定
   - 改善前後の評価を比較
   
3. 職場安全衛生の向上
   - 定期的な再評価で継続的改善
   
4. 法令遵守の確認
   - 労働安全衛生法等の基準との比較`,
    keywords: ['評価結果', '改善', 'スコア', '活用', '解釈']
  }
]

function HelpPageContent(): React.JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    { key: 'all', label: '全て' },
    { key: 'basic', label: '基本操作' },
    { key: 'evaluation', label: '評価方法' },
    { key: 'advanced', label: '活用方法' },
    { key: 'troubleshooting', label: 'トラブルシューティング' }
  ]

  const filteredItems = helpItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        variant="app"
        title="ヘルプ - 3K指数評価システム"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
          >
            戻る
          </Button>
        }
      />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            ヘルプ・使い方ガイド
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            3K指数評価システムの使い方やよくある質問への回答をご確認いただけます。
          </p>
        </div>

        {/* 検索とフィルター */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="キーワードで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.key
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ヘルプ項目一覧 */}
        <div className="space-y-6">
          {filteredItems.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                  該当するヘルプ項目が見つかりませんでした
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  検索キーワードを変更するか、カテゴリを変更してお試しください
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredItems.map(item => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </h2>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.category === 'basic' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                      item.category === 'evaluation' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                      item.category === 'advanced' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {categories.find(cat => cat.key === item.category)?.label}
                    </span>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 leading-relaxed">
                      {item.content}
                    </pre>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1">
                    {item.keywords.map(keyword => (
                      <span
                        key={keyword}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* フッター情報 */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="mb-2">さらにサポートが必要な場合は、システム管理者にお問い合わせください。</p>
            <p className="text-sm">3K指数評価システム ver.1.0.0</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function HelpPage(): React.JSX.Element {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">読み込み中...</div>
      </div>
    }>
      <HelpPageContent />
    </Suspense>
  )
}