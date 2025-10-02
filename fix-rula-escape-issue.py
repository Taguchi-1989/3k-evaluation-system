#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RULAMatrix.tsx のエスケープ問題修正
Line 180のバックスラッシュエスケープを修正
"""
import sys
import io

# Windows console用にUTF-8出力設定
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def fix_escape_issue():
    """エスケープ問題を修正"""
    filepath = 'src/components/evaluation/RULAMatrix.tsx'

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 誤ったエスケープを修正
    # \' → '
    content = content.replace(
        "className={`${getCellClasses(value, rIdx, cIdx)} ${isSelected ? \\'opacity-100\\' : \\'opacity-70\\'}`}",
        "className={`${getCellClasses(value, rIdx, cIdx)} ${isSelected ? 'opacity-100' : 'opacity-70'}`}"
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print('修正完了: src/components/evaluation/RULAMatrix.tsx')
    print('Line 180: バックスラッシュエスケープを修正')
    print('  修正前: \\\'opacity-100\\\' : \\\'opacity-70\\\'')
    print('  修正後: \'opacity-100\' : \'opacity-70\'')


if __name__ == '__main__':
    fix_escape_issue()
    print('\n完了！')
