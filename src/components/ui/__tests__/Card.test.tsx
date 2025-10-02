/**
 * Card コンポーネントのユニットテスト
 * TDD完了フェーズ - 基本的なコンポーネントテスト
 */

/* eslint-disable no-undef */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Card, CardHeader, CardTitle, CardContent } from '../Card'

describe('Card', () => {
  it('基本的なレンダリングができる', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>テストタイトル</CardTitle>
        </CardHeader>
        <CardContent>
          テストコンテンツ
        </CardContent>
      </Card>
    )

    expect(screen.getByText('テストタイトル')).toBeInTheDocument()
    expect(screen.getByText('テストコンテンツ')).toBeInTheDocument()
  })

  it('カスタムclassNameが適用される', () => {
    render(
      <Card className="test-class">
        <CardContent>テスト</CardContent>
      </Card>
    )

    const card = screen.getByText('テスト').closest('div')?.parentElement
    expect(card).toHaveClass('test-class')
    expect(card).toHaveClass('rounded-lg')
  })

  it('子要素が正しく表示される', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>タイトル</CardTitle>
        </CardHeader>
        <CardContent>
          <p>段落1</p>
          <p>段落2</p>
        </CardContent>
      </Card>
    )

    expect(screen.getByRole('heading', { name: 'タイトル' })).toBeInTheDocument()
    expect(screen.getByText('段落1')).toBeInTheDocument()
    expect(screen.getByText('段落2')).toBeInTheDocument()
  })
})

describe('CardHeader', () => {
  it('ヘッダー要素として正しくレンダリングされる', () => {
    render(
      <CardHeader>
        <CardTitle>ヘッダータイトル</CardTitle>
      </CardHeader>
    )

    const header = screen.getByText('ヘッダータイトル').closest('div')
    expect(header).toHaveClass('px-6', 'py-4', 'border-b', 'border-gray-200')
  })
})

describe('CardTitle', () => {
  it('h3要素として正しくレンダリングされる', () => {
    render(<CardTitle>タイトルテスト</CardTitle>)

    const title = screen.getByRole('heading', { level: 3 })
    expect(title).toBeInTheDocument()
    expect(title).toHaveTextContent('タイトルテスト')
  })
})

describe('CardContent', () => {
  it('コンテンツ要素として正しくレンダリングされる', () => {
    render(<CardContent>コンテンツテスト</CardContent>)

    const content = screen.getByText('コンテンツテスト')
    expect(content).toBeInTheDocument()
    expect(content.closest('div')).toHaveClass('px-6', 'py-4')
  })
})