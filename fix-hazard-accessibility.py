#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HazardFactorDetail.tsxのアクセシビリティ警告を修正するスクリプト
Edge DevTools axe警告対応: textarea (1箇所) + select (3箇所)
"""
import sys
import io

# Windows console用にUTF-8出力設定
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def fix_hazard_factor_detail():
    """HazardFactorDetail.tsxの修正"""
    filepath = 'src/components/evaluation/HazardFactorDetail.tsx'

    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    modified = False

    for i, line in enumerate(lines):
        line_num = i + 1

        # Line 330: textarea (事象の説明)
        if line_num == 330 and '<textarea' in line and 'id=' not in line:
            lines[i] = line.replace(
                '<textarea',
                '<textarea\n                            id={`event-desc-${event.id}`}\n                            aria-label={`事象${event.id}の説明`}'
            )
            modified = True
            print(f'Line {line_num}: textarea に id/aria-label 追加')

        # Line 338: select (遭遇頻度)
        elif line_num == 338 and '<select' in line and 'id=' not in line and 'encounterFrequency' in lines[i+2]:
            lines[i] = line.replace(
                '<select',
                '<select\n                            id={`encounter-freq-${event.id}`}\n                            aria-label={`事象${event.id}の遭遇頻度`}'
            )
            modified = True
            print(f'Line {line_num}: 遭遇頻度select に id/aria-label 追加')

        # Line 349: select (可能性)
        elif line_num == 349 and '<select' in line and 'id=' not in line and 'possibility' in lines[i+2]:
            lines[i] = line.replace(
                '<select',
                '<select\n                            id={`possibility-${event.id}`}\n                            aria-label={`事象${event.id}の可能性`}'
            )
            modified = True
            print(f'Line {line_num}: 可能性select に id/aria-label 追加')

        # Line 361: select (深刻度)
        elif line_num == 361 and '<select' in line and 'id=' not in line and 'severityLevel' in lines[i+2]:
            lines[i] = line.replace(
                '<select',
                '<select\n                            id={`severity-${event.id}`}\n                            aria-label={`事象${event.id}の深刻度`}'
            )
            modified = True
            print(f'Line {line_num}: 深刻度select に id/aria-label 追加')

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print(f'\n修正完了: {filepath} (4箇所)')
    else:
        print('既に修正済みまたは対象行が見つかりませんでした')


if __name__ == '__main__':
    fix_hazard_factor_detail()
    print('\n完了！')
