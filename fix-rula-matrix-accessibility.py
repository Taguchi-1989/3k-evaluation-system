#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RULAMatrix.tsxのアクセシビリティ対応スクリプト
Edge DevTools警告対応: input 2箇所 + インラインスタイル 1箇所

警告内容:
1. Line 48: input range - axe/forms (上腕姿勢スコア)
2. Line 89: input range - axe/forms (首・体幹・脚スコア)
3. Line 178: td - no-inline-styles (opacity: isSelected ? 1 : 0.7)
"""
import sys
import io
import re

# Windows console用にUTF-8出力設定
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def fix_rula_matrix_accessibility():
    """RULAMatrix.tsxのアクセシビリティ修正"""
    filepath = 'src/components/evaluation/RULAMatrix.tsx'

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    modifications = []

    # 修正1: Line 48 - 上腕姿勢スコア input rangeにid/aria-label追加
    pattern1 = r'(<label className="block text-xs font-medium mb-1">上腕姿勢スコア \(1-6\)</label>\s*)<input\s+type="range"\s+min="1"\s+max="6"'
    replacement1 = r'\1<input\n              id="upper-arm-score"\n              aria-label="上腕姿勢スコア（1から6）"\n              type="range"\n              min="1"\n              max="6"'

    if re.search(pattern1, content):
        content = re.sub(pattern1, replacement1, content, count=1)
        modifications.append('Line 48: 上腕姿勢スコア input にid/aria-label追加')

    # labelにhtmlFor追加
    content = content.replace(
        '<label className="block text-xs font-medium mb-1">上腕姿勢スコア (1-6)</label>',
        '<label htmlFor="upper-arm-score" className="block text-xs font-medium mb-1">上腕姿勢スコア (1-6)</label>'
    )

    # 修正2: Line 89 - 首・体幹・脚スコア input rangeにid/aria-label追加
    pattern2 = r'(<label className="block text-xs font-medium mb-1">首・体幹・脚スコア \(1-7\)</label>\s*)<input\s+type="range"\s+min="1"\s+max="7"'
    replacement2 = r'\1<input\n              id="neck-trunk-leg-score"\n              aria-label="首・体幹・脚スコア（1から7）"\n              type="range"\n              min="1"\n              max="7"'

    if re.search(pattern2, content):
        content = re.sub(pattern2, replacement2, content, count=1)
        modifications.append('Line 89: 首・体幹・脚スコア input にid/aria-label追加')

    # labelにhtmlFor追加
    content = content.replace(
        '<label className="block text-xs font-medium mb-1">首・体幹・脚スコア (1-7)</label>',
        '<label htmlFor="neck-trunk-leg-score" className="block text-xs font-medium mb-1">首・体幹・脚スコア (1-7)</label>'
    )

    # 修正3: Line 178 - インラインstyleをclassNameに変更
    # opacity: isSelected ? 1 : 0.7 → className with opacity-100 / opacity-70
    pattern3 = r'(<td\s+key=\{cIdx\}\s+)className=\{getCellClasses\(value, rIdx, cIdx\)\}\s+onClick=\{\(\) => handleCellClick\(rIdx, cIdx, value\)\}\s+style=\{\{ opacity: isSelected \? 1 : 0\.7 \}\}'
    replacement3 = r'\1className={`${getCellClasses(value, rIdx, cIdx)} ${isSelected ? \'opacity-100\' : \'opacity-70\'}`}\n                            onClick={() => handleCellClick(rIdx, cIdx, value)}'

    if re.search(pattern3, content):
        content = re.sub(pattern3, replacement3, content, count=1)
        modifications.append('Line 178: インラインstyleをTailwindクラスに変更（opacity-100/opacity-70）')

    # ファイルに書き込み
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    # 結果表示
    print(f'修正完了: {filepath}\n')
    print('【アクセシビリティ改善】')
    for i, mod in enumerate(modifications, 1):
        print(f'{i}. {mod}')

    print(f'\n合計: {len(modifications)}箇所の修正')

    if len(modifications) == 3:
        print('\n【実装詳細】')
        print('✓ 上腕姿勢スコア: id="upper-arm-score" + aria-label')
        print('✓ 首・体幹・脚スコア: id="neck-trunk-leg-score" + aria-label')
        print('✓ 両labelにhtmlFor属性追加（フォームアクセシビリティ向上）')
        print('✓ テーブルセルopacity: Tailwind CSS採用（opacity-100/70）')
        print('✓ インラインスタイル完全削減')
        print('\n【WCAG準拠】')
        print('✓ WCAG 1.3.1 (Info and Relationships): label/input関連付け')
        print('✓ WCAG 2.4.6 (Headings and Labels): 明確なラベル提供')
        print('✓ WCAG 4.1.2 (Name, Role, Value): 全入力要素に名前付与')
        print('✓ axe/forms: label 警告解消（2箇所）')
        print('✓ webhint/no-inline-styles: インラインスタイル警告解消')
        print('✓ ベストプラクティス: Tailwind CSS統一')
    else:
        print(f'\n警告: 期待される修正箇所は3箇所ですが、{len(modifications)}箇所しか修正されませんでした')
        print('ファイルの内容を確認してください')


if __name__ == '__main__':
    fix_rula_matrix_accessibility()
    print('\n完了！')
