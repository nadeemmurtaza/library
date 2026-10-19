#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)

let query = []
let category = null
let industry = null
let language = null
let designSystem = null
let limit = 15
let isJson = false

for (let i = 0; i < args.length; i++) {
  const arg = args[i]
  if (arg === '--category' || arg === '-c') {
    category = args[++i]?.toLowerCase()
  } else if (arg === '--industry' || arg === '-i') {
    industry = args[++i]?.toLowerCase()
  } else if (arg === '--lang' || arg === '-l') {
    language = args[++i]?.toLowerCase()
  } else if (arg === '--system' || arg === '-s') {
    designSystem = args[++i]?.toLowerCase()
  } else if (arg === '--limit' || arg === '-n') {
    limit = parseInt(args[++i], 10) || 15
  } else if (arg === '--json' || arg === '-j') {
    isJson = true
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
Usage: node scripts/find.mjs <query> [options]
       npm run find -- <query> [options]

Options:
  -c, --category <name>    Filter by category (dashboards, templates, modules, components, tokens, assets, etc.)
  -i, --industry <name>    Filter by industry (saas, fintech, ecommerce, marketing, healthcare, general)
  -l, --lang <ext>         Filter by language (typescript, svg, css, html, json, markdown, python)
  -s, --system <name>      Filter by design system (untitledui, daisyui, ui-ux-pro-max, bencium)
  -n, --limit <count>      Maximum results to return (default: 15)
  -j, --json               Output raw JSON array for machine parsing

Examples:
  npm run find -- button
  npm run find -- --category dashboards
  npm run find -- --industry fintech credit card
  npm run find -- --lang typescript table
  npm run find -- --system untitledui modal
`)
    process.exit(0)
  } else {
    query.push(arg)
  }
}

const qStr = query.join(' ').trim().toLowerCase()
const ROOT = path.resolve(import.meta.dirname, '..')
const catalogPath = path.join(ROOT, 'registry/catalog.json')

if (!fs.existsSync(catalogPath)) {
  console.error('Error: registry/catalog.json not found. Run "npm run catalog" first.')
  process.exit(1)
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))
const items = catalog.items || []

// Filter
let results = items.filter((item) => {
  if (category && item.category !== category) return false
  if (industry && item.industry !== industry) return false
  if (language && item.language !== language) return false
  if (designSystem && item.designSystem !== designSystem) return false
  return true
})

if (qStr) {
  const qTokens = qStr.split(/\s+/).filter(Boolean)
  const scored = []

  for (const item of results) {
    const name = item.name.toLowerCase()
    const pathLower = item.path.toLowerCase()
    const sub = (item.subcategory || '').toLowerCase()
    const cat = (item.category || '').toLowerCase()
    const tags = Array.isArray(item.tags) ? item.tags.map((t) => t.toLowerCase()) : []

    let score = 0
    let allTokensMatch = true

    for (const tok of qTokens) {
      let tokMatch = false
      if (name === tok) { score += 100; tokMatch = true }
      else if (name.startsWith(tok)) { score += 60; tokMatch = true }
      else if (name.includes(tok)) { score += 40; tokMatch = true }

      if (tags.some((t) => t === tok)) { score += 50; tokMatch = true }
      else if (tags.some((t) => t.includes(tok))) { score += 30; tokMatch = true }

      if (sub === tok) { score += 30; tokMatch = true }
      else if (sub.includes(tok)) { score += 20; tokMatch = true }

      if (cat === tok) { score += 20; tokMatch = true }

      if (pathLower.includes(tok)) { score += 10; tokMatch = true }

      if (!tokMatch) allTokensMatch = false
    }

    if (allTokensMatch && score > 0) {
      scored.push({ item, score })
    }
  }

  scored.sort((a, b) => b.score - a.score)
  results = scored.map((s) => s.item)
}

results = results.slice(0, limit)

if (isJson) {
  console.log(JSON.stringify(results, null, 2))
  process.exit(0)
}

// Human & AI formatted output
const filterDesc = [
  qStr ? `query '${qStr}'` : '',
  category ? `category=${category}` : '',
  industry ? `industry=${industry}` : '',
  language ? `lang=${language}` : '',
  designSystem ? `system=${designSystem}` : ''
].filter(Boolean).join(', ')

console.log(`\nFound ${results.length} result(s) for ${filterDesc || 'all items'}:\n`)

if (!results.length) {
  console.log('No matches found. Try broadening your query or removing filters.')
  process.exit(0)
}

results.forEach((item, idx) => {
  const meta = [item.category, item.subcategory].filter(Boolean).join('/')
  const tagsStr = item.tags && item.tags.length ? `\n   Tags: ${item.tags.slice(0, 8).join(', ')}` : ''
  console.log(`${idx + 1}. [${meta}] ${item.name} (${item.language}, ${item.industry}, ${item.designSystem})
   Path: ${item.path}${tagsStr}`)
})
console.log('')
