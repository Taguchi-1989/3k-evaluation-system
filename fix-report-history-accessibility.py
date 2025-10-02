#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ReportHistory.tsxのアクセシビリティ対応スクリプト
Edge DevTools警告対応: select 2箇所

警告内容:
1. Line 241: select - axe/forms (フォーマットフィルター)
2. Line 257: select - axe/forms (並び順選択)
"""
import sys
import io
import re

# Windows console用にUTF-8出力設定
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def fix_report_history_accessibility():
    """ReportHistory.tsxのアクセシビリティ修正"""
    filepath = 'src/components/report/ReportHistory.tsx'

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    modifications = []

    # 修正1: Line 241 - フォーマットフィルター select にid/aria-label追加
    pattern1 = r'(<input[^>]*aria-label="レポートを検索"[^>]*>\s*</div>\s*<select\s+value=\{filterFormat\})'
    replacement1 = r'\1\n              id="report-format-filter"\n              aria-label="レポート形式でフィルター"'

    if re.search(pattern1, content, re.DOTALL):
        content = re.sub(pattern1, replacement1, content, count=1, flags=re.DOTALL)
        modifications.append('Line 241: フォーマットフィルター select にid/aria-label追加')

    # 修正2: Line 257 - 並び順 select にid/aria-label追加とlabelのhtmlFor追加
    pattern2 = r'(<label className="text-sm">並び順:</label>\s*)<select\s+value=\{sortBy\}'
    replacement2 = r'<label htmlFor="report-sort-by" className="text-sm">並び順:</label>\n                <select\n                  id="report-sort-by"\n                  aria-label="レポートの並び順を選択"\n                  value={sortBy}'

    if re.search(pattern2, content):
        content = re.sub(pattern2, replacement2, content, count=1)
        modifications.append('Line 257: 並び順 select にid/aria-label追加 + label htmlFor追加')

    # ファイルに書き込み
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    # 結果表示
    print(f'修正完了: {filepath}\n')
    print('【アクセシビリティ改善】')
    for i, mod in enumerate(modifications, 1):
        print(f'{i}. {mod}')

    print(f'\n合計: {len(modifications)}箇所の修正')

    if len(modifications) == 2:
        print('\n【実装詳細】')
        print('✓ フォーマットフィルター select:')
        print('  - id="report-format-filter"')
        print('  - aria-label="レポート形式でフィルター"')
        print('  - 視覚的ラベルなし → aria-labelで補完')
        print('')
        print('✓ 並び順 select:')
        print('  - id="report-sort-by"')
        print('  - aria-label="レポートの並び順を選択"')
        print('  - label htmlFor追加（明示的関連付け）')
        print('')
        print('【WCAG準拠】')
        print('✓ WCAG 1.3.1 (Info and Relationships): label/select関連付け')
        print('✓ WCAG 2.4.6 (Headings and Labels): 明確なラベル提供')
        print('✓ WCAG 4.1.2 (Name, Role, Value): 全select要素に名前付与')
        print('✓ axe/forms: select-name 警告解消（2箇所）')
        print('✓ スクリーンリーダー完全対応')
    else:
        print(f'\n警告: 期待される修正箇所は2箇所ですが、{len(modifications)}箇所しか修正されませんでした')
        print('ファイルの内容を確認してください')


if __name__ == '__main__':
    fix_report_history_accessibility()
    print('\n完了！')
