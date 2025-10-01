#!/usr/bin/env node
/**
 * Pre-commit Guard: Prevent mixing UI and Logic changes
 */

const { execSync } = require('child_process')

try {
  const diff = execSync('git diff --cached --name-only', { encoding: 'utf8' })
  const files = diff.split('\n').filter(Boolean)

  const isUI = (p) => /^(packages\/ui|src\/.*\/styles|.*tailwind.*)/.test(p)
  const isLogic = (p) => /^(packages\/core|packages\/ports|packages\/adapters-)/.test(p)

  const touchedUI = files.some(isUI)
  const touchedLogic = files.some(isLogic)

  if (touchedUI && touchedLogic) {
    console.error(`
❌ UIとロジックを同時に変更しています。

UI files:
${files.filter(isUI).map(f => '  - ' + f).join('\n')}

Logic files:
${files.filter(isLogic).map(f => '  - ' + f).join('\n')}

コミットを分けてください。強制する場合は --no-verify を使用。
`)
    process.exit(1)
  }

  console.log('✅ UI/Logic separation check passed')
} catch {
  // git diff が失敗した場合はスキップ（例: 初回コミット）
  console.log('⚠️  Git check skipped')
}