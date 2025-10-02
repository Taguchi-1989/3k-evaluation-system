#!/usr/bin/env node
/**
 * アクセシビリティ修正の検証スクリプト
 * 全ての修正が正しく適用されているか確認
 */

const fs = require('fs');
const path = require('path');

const checks = [
  {
    file: 'src/components/evaluation/MentalFactorDetail.tsx',
    description: 'MentalFactorDetail - 情報ボタン',
    pattern: /aria-label=\{`\$\{item\.label\}の詳細情報`\}/,
    line: 467
  },
  {
    file: 'src/components/evaluation/MentalFactorDetail.tsx',
    description: 'MentalFactorDetail - SVG aria-hidden',
    pattern: /<svg aria-hidden="true"/,
    line: 470
  },
  {
    file: 'src/components/evaluation/MentalFactorDetail.tsx',
    description: 'MentalFactorDetail - 程度選択select',
    pattern: /id=\{`mental-severity-\$\{item\.id\}`\}/,
    line: 495
  },
  {
    file: 'src/components/evaluation/MentalFactorDetail.tsx',
    description: 'MentalFactorDetail - 時間割合select',
    pattern: /id=\{`mental-duration-\$\{item\.id\}`\}/,
    line: 507
  },
  {
    file: 'src/components/evaluation/HazardPsychologicalAssessment.tsx',
    description: 'HazardPsychological - 事故日 (一意ID)',
    pattern: /id=\{`accident-history-date-\$\{index\}`\}/,
    line: 176
  },
  {
    file: 'src/components/evaluation/HazardPsychologicalAssessment.tsx',
    description: 'HazardPsychological - 継続リスク (一意ID)',
    pattern: /id=\{`ongoing-risk-description-\$\{index\}`\}/,
    line: 493
  },
  {
    file: 'src/components/evaluation/GenericFactorDetail.tsx',
    description: 'GenericFactorDetail - 評価項目select',
    pattern: /id="generic-eval-item-1"/,
    line: 82
  },
  {
    file: 'src/components/evaluation/HazardFactorDetail.tsx',
    description: 'HazardFactorDetail - 事象説明textarea',
    pattern: /id=\{`event-desc-\$\{event\.id\}`\}/,
    line: 333
  }
];

console.log('============================================');
console.log('  アクセシビリティ修正検証');
console.log('============================================\n');

let passCount = 0;
let failCount = 0;

checks.forEach((check, index) => {
  const filePath = path.join(__dirname, check.file);

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // パターンマッチング
    const found = content.match(check.pattern);

    if (found) {
      console.log(`✓ [${index + 1}/${checks.length}] ${check.description}`);
      console.log(`   ファイル: ${check.file}`);
      console.log(`   想定行: ${check.line}`);
      passCount++;
    } else {
      console.log(`✗ [${index + 1}/${checks.length}] ${check.description}`);
      console.log(`   ファイル: ${check.file}`);
      console.log(`   エラー: パターンが見つかりません`);
      console.log(`   期待: ${check.pattern}`);
      failCount++;
    }
    console.log('');
  } catch (error) {
    console.log(`✗ [${index + 1}/${checks.length}] ${check.description}`);
    console.log(`   ファイル: ${check.file}`);
    console.log(`   エラー: ${error.message}`);
    failCount++;
    console.log('');
  }
});

console.log('============================================');
console.log(`  結果: ${passCount}/${checks.length} 成功`);
if (failCount === 0) {
  console.log('  ✓ 全ての修正が正しく適用されています！');
} else {
  console.log(`  ✗ ${failCount}個の修正が見つかりません`);
}
console.log('============================================\n');

if (failCount === 0) {
  console.log('【次のステップ】');
  console.log('1. clear-dev-cache.bat を実行');
  console.log('2. ブラウザでハードリロード (Ctrl+Shift+R)');
  console.log('3. Edge DevTools → Issues タブで確認\n');
} else {
  console.log('【修正が必要】');
  console.log('上記のエラーを確認してください。\n');
  process.exit(1);
}
