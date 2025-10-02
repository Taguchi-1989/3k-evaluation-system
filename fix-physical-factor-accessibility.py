#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PhysicalFactorDetail.tsxのアクセシビリティ対応スクリプト
Edge DevTools警告対応: button 2箇所 + インラインスタイル 1箇所

警告内容:
1. Line 35: button - axe/name-role-value (閉じるボタン - HelpModal用)
2. Line 885: button - axe/name-role-value (閉じるボタン - メインヘルプモーダル用)
3. Line 572: svg - no-inline-styles (インラインstyleをクラスに変更)
"""
import sys
import io
import re

# Windows console用にUTF-8出力設定
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def fix_physical_factor_accessibility():
    """PhysicalFactorDetail.tsxのアクセシビリティ修正"""
    filepath = 'src/components/evaluation/PhysicalFactorDetail.tsx'

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    modifications = []

    # 修正1: Line 35 - HelpModal内の閉じるボタンにaria-label追加
    pattern1 = r'(<h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">\{title\}</h3>\s*)<button onClick=\{onClose\} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">\s*<svg className="w-6 h-6"'
    replacement1 = r'\1<button\n            onClick={onClose}\n            aria-label="ヘルプモーダルを閉じる"\n            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"\n          >\n            <svg aria-hidden="true" className="w-6 h-6"'

    if re.search(pattern1, content):
        content = re.sub(pattern1, replacement1, content, count=1)
        modifications.append('Line 35: HelpModal閉じるボタンにaria-label追加 + SVGにaria-hidden追加')

    # 修正2: Line 885 - メインヘルプモーダルの閉じるボタンにaria-label追加
    pattern2 = r'(<h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">姿勢評価ヘルプ</h3>\s*)<button\s+data-testid="close-modal"\s+onClick=\{\(\) => setIsHelpModalOpen\(false\)\}\s+className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"\s*>\s*<svg className="w-6 h-6"'
    replacement2 = r'\1<button\n                data-testid="close-modal"\n                onClick={() => setIsHelpModalOpen(false)}\n                aria-label="姿勢評価ヘルプモーダルを閉じる"\n                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"\n              >\n                <svg aria-hidden="true" className="w-6 h-6"'

    if re.search(pattern2, content):
        content = re.sub(pattern2, replacement2, content, count=1)
        modifications.append('Line 885: メインヘルプモーダル閉じるボタンにaria-label追加 + SVGにaria-hidden追加')

    # 修正3: Line 572 - インラインstyleをTailwindクラスに変更
    # transform: rotate(180deg) → rotate-180
    # transform: rotate(0deg) → rotate-0
    pattern3 = r'<svg className="w-3 h-3 ml-1 transition-transform" style=\{\{transform: isMethodDropdownOpen \? \'rotate\(180deg\)\' : \'rotate\(0deg\)\'\}\}>'
    replacement3 = r'<svg\n                  aria-hidden="true"\n                  className={`w-3 h-3 ml-1 transition-transform ${isMethodDropdownOpen ? \'rotate-180\' : \'rotate-0\'}`}\n                >'

    if re.search(pattern3, content):
        content = re.sub(pattern3, replacement3, content, count=1)
        modifications.append('Line 572: インラインstyleをTailwindクラスに変更（rotate-180/rotate-0）+ aria-hidden追加')

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
        print('✓ HelpModal閉じるボタン: aria-label="ヘルプモーダルを閉じる"')
        print('✓ メインヘルプモーダル閉じるボタン: aria-label="姿勢評価ヘルプモーダルを閉じる"')
        print('✓ 装飾SVG: aria-hidden="true" 追加（3箇所全て）')
        print('✓ インラインスタイル削除: style={{}} → className={``}')
        print('✓ Tailwindクラス採用: rotate-180 / rotate-0')
        print('\n【WCAG準拠】')
        print('✓ WCAG 2.1.1 (Keyboard): 全ボタンキーボード操作可能')
        print('✓ WCAG 4.1.2 (Name, Role, Value): 全ボタンに名前付与')
        print('✓ axe/name-role-value: button-name 警告解消（2箇所）')
        print('✓ webhint: no-inline-styles 警告解消')
        print('✓ ベストプラクティス: Tailwind CSS使用でメンテナンス性向上')
    else:
        print(f'\n警告: 期待される修正箇所は3箇所ですが、{len(modifications)}箇所しか修正されませんでした')
        print('ファイルの内容を確認してください')


if __name__ == '__main__':
    fix_physical_factor_accessibility()
    print('\n完了！')
