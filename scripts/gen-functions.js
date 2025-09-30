#!/usr/bin/env node
/**
 * Function Registry Generator
 * Scans ports and core packages for exported functions/interfaces
 */

const fs = require('fs')
const path = require('path')
const { glob } = require('glob')

const SCAN_PATTERNS = [
  'packages/ports/**/*.ts',
  'packages/core/src/**/*.ts'
]

async function extractFunctions() {
  const items = []

  for (const pattern of SCAN_PATTERNS) {
    const files = await glob(pattern, { cwd: process.cwd(), absolute: true })

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8')
      const relativePath = path.relative(process.cwd(), file)

      // Extract interface names
      const interfaceMatches = content.matchAll(/export\s+interface\s+(\w+)/g)
      for (const match of interfaceMatches) {
        items.push({
          name: match[1],
          type: 'interface',
          file: relativePath,
          package: relativePath.split(path.sep)[1]
        })
      }

      // Extract type aliases
      const typeMatches = content.matchAll(/export\s+type\s+(\w+)/g)
      for (const match of typeMatches) {
        items.push({
          name: match[1],
          type: 'type',
          file: relativePath,
          package: relativePath.split(path.sep)[1]
        })
      }

      // Extract exported functions
      const functionMatches = content.matchAll(/export\s+(?:async\s+)?function\s+(\w+)/g)
      for (const match of functionMatches) {
        items.push({
          name: match[1],
          type: 'function',
          file: relativePath,
          package: relativePath.split(path.sep)[1]
        })
      }
    }
  }

  return items
}

async function main() {
  console.log('🔍 Scanning for functions and types...')

  const items = await extractFunctions()

  // Write JSON
  const jsonPath = 'docs/functions.json'
  fs.mkdirSync('docs', { recursive: true })
  fs.writeFileSync(jsonPath, JSON.stringify(items, null, 2))
  console.log(`✅ Generated ${jsonPath} (${items.length} items)`)

  // Write Markdown
  const mdPath = 'docs/FUNCTIONS.md'
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.package]) acc[item.package] = []
    acc[item.package].push(item)
    return acc
  }, {})

  let md = '# Function Registry\n\nGenerated: ' + new Date().toISOString() + '\n\n'

  for (const [pkg, pkgItems] of Object.entries(grouped)) {
    md += `## ${pkg}\n\n`
    for (const item of pkgItems) {
      md += `- **${item.name}** (${item.type})\n  \`${item.file}\`\n`
    }
    md += '\n'
  }

  fs.writeFileSync(mdPath, md)
  console.log(`✅ Generated ${mdPath}`)

  // Create base snapshot if not exists
  const basePath = 'docs/functions.base.json'
  if (!fs.existsSync(basePath)) {
    fs.writeFileSync(basePath, JSON.stringify(items, null, 2))
    console.log(`📸 Created baseline snapshot: ${basePath}`)
  }
}

main().catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})