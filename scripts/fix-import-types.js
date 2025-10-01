#!/usr/bin/env node
/**
 * ESLint consistent-type-imports 自動修正スクリプト
 * import { Type } from 'module' → import type { Type } from 'module'
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
  './src/app/reports/page.tsx',
  './src/app/test/ai-features/page.tsx',
  './src/components/auth/PermissionGuard.tsx',
  './src/components/dashboard/DashboardStats.tsx',
  './src/components/dashboard/EnhancedDashboard.tsx',
  './src/components/dashboard/ReportsDashboard.tsx',
  './src/components/ErrorBoundary.tsx',
  './src/components/evaluation/DynamicMatrixDisplay.tsx',
  './src/components/evaluation/EvaluationEditModal.tsx',
  './src/components/evaluation/GenericFactorDetail.tsx',
  './src/components/evaluation/MatrixTestPage.tsx',
  './src/components/evaluation/PhysicalFactorDetail.tsx',
  './src/components/layout/EvaluationLayout.tsx',
  './src/components/layout/FactorPageLayout.tsx',
  './src/components/layout/PageLayout.tsx',
  './src/components/optimized/DynamicAIAssistant.tsx',
  './src/components/optimized/PerformanceProvider.tsx',
  './src/components/report/ReportHistory.tsx',
  './src/components/ui/AIComprehensiveAssistant.tsx',
  './src/components/ui/AspectContainer.tsx',
  './src/components/ui/Button.tsx',
  './src/components/ui/Card.tsx',
  './src/components/ui/Input.tsx',
  './src/components/ui/TabInterface.tsx',
  './src/components/ui/ValidatedForm.tsx',
  './src/contexts/AuthContext.tsx',
  './src/data/defaultEvaluationData.ts',
  './src/lib/aiAssistant.ts',
  './src/lib/calculation.ts',
  './src/lib/database/evaluationService.ts',
  './src/lib/evaluationEngine.ts',
  './src/lib/history.ts',
  './src/lib/matrixCalculator.ts',
  './src/lib/reportGenerator.ts',
];

function fixFile(filePath) {
  const fullPath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  let modified = false;

  // 既に import type になっているものはスキップ
  // import { で始まるものを import type { に変換する候補を探す
  const lines = content.split('\n');
  const newLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // import type が既にある行はスキップ
    if (line.match(/^import\s+type\s+/)) {
      newLines.push(line);
      continue;
    }

    // import { ... } from ... のパターン
    const match = line.match(/^import\s+\{([^}]+)\}\s+from\s+(['"][^'"]+['"])/);
    if (match) {
      // コメントでtype-onlyと明示されているか確認
      // または、後続のコードで値として使われていないかチェック（簡易版）
      const imports = match[1];

      // 大文字始まりのみ、または type/interface キーワードがある場合は type import に変換
      const hasUpperCaseStart = /[A-Z]/.test(imports.trim()[0]);
      const hasTypeKeyword = /\btype\b|\binterface\b/.test(imports);

      if (hasUpperCaseStart || hasTypeKeyword ||
          imports.includes('Props') ||
          imports.includes('Type') ||
          imports.includes('Interface') ||
          imports.includes('Result') ||
          imports.includes('Input') ||
          imports.includes('Output') ||
          imports.includes('Config') ||
          imports.includes('Data') ||
          imports.includes('Metrics') ||
          imports.includes('Permission')) {
        newLines.push(`import type ${match[0].substring(6)}`);
        modified = true;
        continue;
      }
    }

    newLines.push(line);
  }

  if (modified) {
    fs.writeFileSync(fullPath, newLines.join('\n'), 'utf-8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  } else {
    console.log(`⏭️  No changes: ${filePath}`);
    return false;
  }
}

let fixedCount = 0;
console.log('🔧 Fixing import type statements...\n');

for (const file of filesToFix) {
  if (fixFile(file)) {
    fixedCount++;
  }
}

console.log(`\n✨ Fixed ${fixedCount} files out of ${filesToFix.length}`);
