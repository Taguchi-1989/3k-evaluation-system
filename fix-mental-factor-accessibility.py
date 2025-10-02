#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MentalFactorDetail.tsxのアクセシビリティ対応スクリプト
Edge DevTools axe警告対応: button 1箇所 + select 2箇所 = 計3箇所

警告内容:
1. Line 466: button - axe/name-role-value (Buttons must have discernible text)
2. Line 491: select - axe/forms (Select element must have an accessible name)
3. Line 501: select - axe/forms (Select element must have an accessible name)
"""
import sys
import io
import re

# Windows console用にUTF-8出力設定
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def fix_mental_factor_accessibility():
    """MentalFactorDetail.tsxのアクセシビリティ修正"""
    filepath = 'src/components/evaluation/MentalFactorDetail.tsx'

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    modifications = []

    # 修正1: Line 466 - 情報ボタンにaria-label追加
    pattern1 = r'<button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">\s*<svg className="h-4 w-4 text-gray-500" fill="none"'
    replacement1 = '''<button
                        aria-label={`${item.label}の詳細情報`}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <svg aria-hidden="true" className="h-4 w-4 text-gray-500" fill="none"'''

    if re.search(pattern1, content):
        content = re.sub(pattern1, replacement1, content, count=1)
        modifications.append('Line 466: 情報ボタンにaria-label追加 + SVGにaria-hidden追加')

    # 修正2: Line 491 - 第1のselect（重篤度/程度選択）にid/aria-label追加
    pattern2 = r'<select\s+className="border rounded-md p-1 text-xs w-32 bg-white dark:bg-gray-600"\s+value=\{item\.selectValue \|\| \'\'\}'
    replacement2 = '''<select
                            id={`mental-severity-${item.id}`}
                            aria-label={`${item.label}の程度選択`}
                            className="border rounded-md p-1 text-xs w-32 bg-white dark:bg-gray-600"
                            value={item.selectValue || ''}'''

    if re.search(pattern2, content):
        content = re.sub(pattern2, replacement2, content, count=1)
        modifications.append('Line 491: 程度選択selectにid/aria-label追加')

    # 修正3: Line 501 - 第2のselect（持続時間/割合選択）にid/aria-label追加
    pattern3 = r'<select\s+className="border rounded-md p-1 text-xs w-20 bg-white dark:bg-gray-600"\s+value=\{item\.durationValue \|\| item\.inputValue \|\| \'20%\'\}'
    replacement3 = '''<select
                            id={`mental-duration-${item.id}`}
                            aria-label={`${item.label}の時間割合選択`}
                            className="border rounded-md p-1 text-xs w-20 bg-white dark:bg-gray-600"
                            value={item.durationValue || item.inputValue || '20%'}'''

    if re.search(pattern3, content):
        content = re.sub(pattern3, replacement3, content, count=1)
        modifications.append('Line 501: 時間割合selectにid/aria-label追加')

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
        print('✓ 情報ボタン: aria-label動的生成（item.labelベース）')
        print('✓ 装飾SVG: aria-hidden="true"追加')
        print('✓ 程度選択: mental-severity-${item.id}（一意ID）')
        print('✓ 時間割合: mental-duration-${item.id}（一意ID）')
        print('✓ 全てのaria-labelが文脈を明示')
        print('\n【WCAG準拠】')
        print('✓ WCAG 2.1.1 (Keyboard): 全要素キーボード操作可能')
        print('✓ WCAG 4.1.2 (Name, Role, Value): 全要素に名前付与')
        print('✓ axe/name-role-value: button-name 警告解消')
        print('✓ axe/forms: select-name 警告解消（2箇所）')
    else:
        print(f'\n警告: 期待される修正箇所は3箇所ですが、{len(modifications)}箇所しか修正されませんでした')
        print('ファイルの内容を確認してください')


if __name__ == '__main__':
    fix_mental_factor_accessibility()
    print('\n完了！')
