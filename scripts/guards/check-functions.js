#!/usr/bin/env node
/**
 * Function Registry Guard
 * Prevents accidental removal of public APIs
 */

const fs = require('fs')

function main() {
  const currentPath = 'docs/functions.json'
  const basePath = 'docs/functions.base.json'

  if (!fs.existsSync(currentPath)) {
    console.error('❌ functions.json not found. Run `npm run gen:functions` first.')
    process.exit(1)
  }

  if (!fs.existsSync(basePath)) {
    console.log('⚠️  No baseline found. This is the first run.')
    return
  }

  const current = JSON.parse(fs.readFileSync(currentPath, 'utf8'))
  const base = JSON.parse(fs.readFileSync(basePath, 'utf8'))

  const currentNames = new Set(current.map(x => x.name))
  const baseNames = new Set(base.map(x => x.name))

  const removed = [...baseNames].filter(n => !currentNames.has(n))

  if (removed.length > 0) {
    console.error('❌ Removed functions detected:', removed.join(', '))
    console.error('   If intentional, update functions.base.json and document breaking changes.')
    process.exit(1)
  }

  console.log('✅ No functions removed')
}

main()