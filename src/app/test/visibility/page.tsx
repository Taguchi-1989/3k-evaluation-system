'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export default function VisibilityTestPage() {
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [selectedRow, setSelectedRow] = useState<number | null>(null)

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="text-xl font-bold">視認性テストページ</h1>
      </header>

      <main className="page-content p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* 強調表示テスト */}
          <section className="card">
            <h2 className="text-lg font-semibold mb-4">強調表示の視認性テスト</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded highlight">
                <strong>黄色強調</strong>
                <p className="text-sm">通常の強調表示</p>
              </div>
              <div className="p-4 rounded selected">
                <strong>青色選択</strong>
                <p className="text-sm">選択された項目</p>
              </div>
              <div className="p-4 rounded success">
                <strong>緑色成功</strong>
                <p className="text-sm">成功・完了状態</p>
              </div>
              <div className="p-4 rounded error">
                <strong>赤色エラー</strong>
                <p className="text-sm">エラー・警告状態</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded highlight-strong">
                <strong>強い黄色強調</strong>
                <p className="text-sm">重要な強調表示</p>
              </div>
              <div className="p-4 rounded selected-strong">
                <strong>強い青色選択</strong>
                <p className="text-sm">アクティブな選択</p>
              </div>
              <div className="p-4 rounded success-strong">
                <strong>強い緑色成功</strong>
                <p className="text-sm">重要な成功状態</p>
              </div>
              <div className="p-4 rounded error-strong">
                <strong>強い赤色エラー</strong>
                <p className="text-sm">重要なエラー</p>
              </div>
            </div>
          </section>

          {/* カードの強調表示 */}
          <section className="card">
            <h2 className="text-lg font-semibold mb-4">カードの選択状態</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`card cursor-pointer ${selectedCard === i ? 'selected' : ''}`}
                  onClick={() => setSelectedCard(i)}
                >
                  <h3 className="font-medium mb-2">カード {i}</h3>
                  <p className="text-sm text-gray-600">
                    クリックして選択状態を確認
                  </p>
                  {selectedCard === i && (
                    <div className="mt-2 text-sm font-medium text-blue-600">
                      ✓ 選択中
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* テーブルの強調表示 */}
          <section className="card">
            <h2 className="text-lg font-semibold mb-4">テーブル行の選択</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">項目</th>
                    <th className="text-left p-2">状態</th>
                    <th className="text-left p-2">スコア</th>
                    <th className="text-left p-2">評価</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: '肉体因子', status: '完了', score: 8, level: 'high' },
                    { name: '精神因子', status: '進行中', score: 5, level: 'medium' },
                    { name: '環境因子', status: '未開始', score: 2, level: 'low' },
                    { name: '危険因子', status: '完了', score: 7, level: 'high' },
                  ].map((item, index) => (
                    <tr
                      key={index}
                      className={`border-b cursor-pointer ${selectedRow === index ? 'selected' : ''}`}
                      onClick={() => setSelectedRow(index)}
                    >
                      <td className="p-2">{item.name}</td>
                      <td className="p-2">
                        <span className={`badge badge-${
                          item.status === '完了' ? 'green' :
                          item.status === '進行中' ? 'yellow' : 'red'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-2">
                        <span className={`score-${item.level}`}>
                          {item.score}
                        </span>
                      </td>
                      <td className="p-2">
                        <span className={
                          item.level === 'high' ? 'text-red-600 font-bold' :
                          item.level === 'medium' ? 'text-yellow-600 font-medium' :
                          'text-green-600'
                        }>
                          {item.level === 'high' ? '高' :
                           item.level === 'medium' ? '中' : '低'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ボタンスタイル */}
          <section className="card">
            <h2 className="text-lg font-semibold mb-4">ボタンスタイル</h2>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">プライマリボタン</Button>
              <Button variant="secondary">セカンダリボタン</Button>
              <Button variant="outline">アウトラインボタン</Button>
              <Button variant="ghost">ゴーストボタン</Button>
              <Button variant="primary" disabled>無効化ボタン</Button>
            </div>
          </section>

          {/* バッジスタイル */}
          <section className="card">
            <h2 className="text-lg font-semibold mb-4">バッジ・ラベル</h2>
            
            <div className="flex flex-wrap gap-4">
              <span className="badge badge-blue">青バッジ</span>
              <span className="badge badge-green">緑バッジ</span>
              <span className="badge badge-yellow">黄バッジ</span>
              <span className="badge badge-red">赤バッジ</span>
            </div>
          </section>

          {/* フォーム要素 */}
          <section className="card">
            <h2 className="text-lg font-semibold mb-4">フォーム要素</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  テキスト入力（フォーカスして確認）
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder="フォーカス時の強調を確認"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  テキストエリア
                </label>
                <textarea
                  className="w-full p-2 border rounded"
                  rows={3}
                  placeholder="複数行のテキスト入力"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  セレクトボックス
                </label>
                <select className="w-full p-2 border rounded">
                  <option>オプション1</option>
                  <option>オプション2</option>
                  <option>オプション3</option>
                </select>
              </div>
            </div>
          </section>

          {/* コードブロック */}
          <section className="card">
            <h2 className="text-lg font-semibold mb-4">コード表示</h2>
            
            <div className="space-y-4">
              <p>
                インラインコード: <code>const value = 42;</code> の表示
              </p>
              
              <pre>
                <code>{`// コードブロックの表示
function calculate(a, b) {
  return a + b;
}

const result = calculate(10, 20);
// eslint-disable-next-line no-console
console.log(result); // 30`}</code>
              </pre>
            </div>
          </section>

          {/* リンクスタイル */}
          <section className="card">
            <h2 className="text-lg font-semibold mb-4">リンクスタイル</h2>
            
            <div className="space-y-2">
              <p>
                <a href="#" onClick={(e) => e.preventDefault()}>通常のリンク</a>
              </p>
              <p>
                <a href="#" onClick={(e) => e.preventDefault()} className="font-medium">
                  太字のリンク
                </a>
              </p>
              <p>
                <button className="text-blue-600 hover:text-blue-800 underline">
                  ボタンスタイルのリンク
                </button>
              </p>
            </div>
          </section>

          {/* 評価スコア表示 */}
          <section className="card">
            <h2 className="text-lg font-semibold mb-4">評価スコア表示</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">高リスク</div>
                <div className="score-high text-2xl px-4 py-2 rounded">
                  8-10
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">中リスク</div>
                <div className="score-medium text-2xl px-4 py-2 rounded">
                  4-7
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">低リスク</div>
                <div className="score-low text-2xl px-4 py-2 rounded">
                  1-3
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}