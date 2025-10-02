#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HazardPsychologicalAssessment.tsxのアクセシビリティ対応スクリプト
Edge DevTools axe警告対応: input 2箇所 + select 9箇所 = 計11箇所
"""
import sys
import io
import re

# Windows console用にUTF-8出力設定
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def fix_hazard_psychological_assessment():
    """HazardPsychologicalAssessment.tsxの修正"""
    filepath = 'src/components/evaluation/HazardPsychologicalAssessment.tsx'

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    modifications = []

    # Line 175: 事故日 input
    pattern1 = r'(<label className="block text-sm font-medium text-gray-700 mb-1">\s*事故日\s*</label>\s*)<input\s+type="date"'
    replacement1 = r'\1<input\n                      id={`accident-date-${index}`}\n                      aria-label={`事故履歴${index + 1}の事故日`}\n                      type="date"'
    if re.search(pattern1, content):
        content = re.sub(pattern1, replacement1, content, count=1)
        modifications.append('Line 175: 事故日 input に id/aria-label 追加')

    # Line 212: 重篤度 select
    pattern2 = r'(<label className="block text-sm font-medium text-gray-700 mb-1">\s*重篤度\s*</label>\s*)<select\s+value=\{event\.severity\}'
    replacement2 = r'\1<select\n                      id={`accident-severity-${index}`}\n                      aria-label={`事故履歴${index + 1}の重篤度`}\n                      value={event.severity}'
    if re.search(pattern2, content):
        content = re.sub(pattern2, replacement2, content, count=1)
        modifications.append('Line 212: 重篤度 select に id/aria-label 追加')

    # Line 253: 防止策の効果 select
    pattern3 = r'(<label className="block text-sm font-medium text-gray-700 mb-1">\s*防止策の効果\s*</label>\s*)<select\s+value=\{event\.effectiveness\}'
    replacement3 = r'\1<select\n                      id={`accident-effectiveness-${index}`}\n                      aria-label={`事故履歴${index + 1}の防止策の効果`}\n                      value={event.effectiveness}'
    if re.search(pattern3, content):
        content = re.sub(pattern3, replacement3, content, count=1)
        modifications.append('Line 253: 防止策の効果 select に id/aria-label 追加')

    # Line 337: 法令順守度 select
    pattern4 = r'(<label className="block text-sm font-medium text-gray-700 mb-2">\s*法令順守度\s*</label>\s*)<select\s+value=\{safetyManagement\.complianceLevel\}'
    replacement4 = r'\1<select\n                id="compliance-level"\n                aria-label="安全管理体制の法令順守度"\n                value={safetyManagement.complianceLevel}'
    if re.search(pattern4, content):
        content = re.sub(pattern4, replacement4, content, count=1)
        modifications.append('Line 337: 法令順守度 select に id/aria-label 追加')

    # Line 356: 安全教育充実度 select
    pattern5 = r'(<label className="block text-sm font-medium text-gray-700 mb-2">\s*安全教育充実度\s*</label>\s*)<select\s+value=\{safetyManagement\.trainingAdequacy\}'
    replacement5 = r'\1<select\n                id="training-adequacy"\n                aria-label="安全管理体制の教育充実度"\n                value={safetyManagement.trainingAdequacy}'
    if re.search(pattern5, content):
        content = re.sub(pattern5, replacement5, content, count=1)
        modifications.append('Line 356: 安全教育充実度 select に id/aria-label 追加')

    # Line 375: インシデント報告制度 select
    pattern6 = r'(<label className="block text-sm font-medium text-gray-700 mb-2">\s*インシデント報告制度\s*</label>\s*)<select\s+value=\{safetyManagement\.reportingSystem\}'
    replacement6 = r'\1<select\n                id="reporting-system"\n                aria-label="安全管理体制の報告制度"\n                value={safetyManagement.reportingSystem}'
    if re.search(pattern6, content):
        content = re.sub(pattern6, replacement6, content, count=1)
        modifications.append('Line 375: インシデント報告制度 select に id/aria-label 追加')

    # Line 394: リスク評価頻度 select
    pattern7 = r'(<label className="block text-sm font-medium text-gray-700 mb-2">\s*リスク評価頻度\s*</label>\s*)<select\s+value=\{safetyManagement\.riskAssessmentFreq\}'
    replacement7 = r'\1<select\n                id="risk-assessment-freq"\n                aria-label="安全管理体制のリスク評価頻度"\n                value={safetyManagement.riskAssessmentFreq}'
    if re.search(pattern7, content):
        content = re.sub(pattern7, replacement7, content, count=1)
        modifications.append('Line 394: リスク評価頻度 select に id/aria-label 追加')

    # Line 478: リスク内容 input
    pattern8 = r'(<label className="block text-sm font-medium text-gray-700 mb-1">\s*リスク内容\s*</label>\s*)<input\s+type="text"\s+value=\{risk\.riskDescription\}'
    replacement8 = r'\1<input\n                    id={`risk-description-${index}`}\n                    aria-label={`継続リスク${index + 1}の内容`}\n                    type="text"\n                    value={risk.riskDescription}'
    if re.search(pattern8, content):
        content = re.sub(pattern8, replacement8, content, count=1)
        modifications.append('Line 478: リスク内容 input に id/aria-label 追加')

    # Line 496: 再発確率 select
    pattern9 = r'(<label className="block text-sm font-medium text-gray-700 mb-1">\s*再発確率\s*</label>\s*)<select\s+value=\{risk\.recurrenceProbability\}'
    replacement9 = r'\1<select\n                    id={`risk-recurrence-${index}`}\n                    aria-label={`継続リスク${index + 1}の再発確率`}\n                    value={risk.recurrenceProbability}'
    if re.search(pattern9, content):
        content = re.sub(pattern9, replacement9, content, count=1)
        modifications.append('Line 496: 再発確率 select に id/aria-label 追加')

    # Line 519: 潜在的影響度 select
    pattern10 = r'(<label className="block text-sm font-medium text-gray-700 mb-1">\s*潜在的影響度\s*</label>\s*)<select\s+value=\{risk\.potentialImpact\}'
    replacement10 = r'\1<select\n                    id={`risk-impact-${index}`}\n                    aria-label={`継続リスク${index + 1}の潜在的影響度`}\n                    value={risk.potentialImpact}'
    if re.search(pattern10, content):
        content = re.sub(pattern10, replacement10, content, count=1)
        modifications.append('Line 519: 潜在的影響度 select に id/aria-label 追加')

    # Line 541: 現在の状況 select
    pattern11 = r'(<label className="block text-sm font-medium text-gray-700 mb-1">\s*現在の状況\s*</label>\s*)<select\s+value=\{risk\.currentStatus\}'
    replacement11 = r'\1<select\n                    id={`risk-status-${index}`}\n                    aria-label={`継続リスク${index + 1}の現在の状況`}\n                    value={risk.currentStatus}'
    if re.search(pattern11, content):
        content = re.sub(pattern11, replacement11, content, count=1)
        modifications.append('Line 541: 現在の状況 select に id/aria-label 追加')

    # ファイルに書き込み
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    # 結果表示
    print(f'修正完了: {filepath}\n')
    for i, mod in enumerate(modifications, 1):
        print(f'{i}. {mod}')
    print(f'\n合計: {len(modifications)}箇所のアクセシビリティ改善')

    if len(modifications) != 11:
        print(f'\n警告: 期待される修正箇所は11箇所ですが、{len(modifications)}箇所しか修正されませんでした')
        print('ファイルの内容を確認してください')


if __name__ == '__main__':
    fix_hazard_psychological_assessment()
    print('\n完了！')
