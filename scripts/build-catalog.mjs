import fs from 'node:fs'
import path from 'node:path'

const SOURCE = 'library'
const LICENSE = 'MIT'
const items = []

function detectLanguage(filepath) {
  const ext = path.extname(filepath).toLowerCase()
  switch (ext) {
    case '.ts':
    case '.tsx':
      return 'typescript'
    case '.js':
    case '.mjs':
    case '.jsx':
      return 'javascript'
    case '.css':
      return 'css'
    case '.html':
      return 'html'
    case '.svg':
      return 'svg'
    case '.json':
      return 'json'
    case '.md':
      return 'markdown'
    case '.py':
      return 'python'
    case '.woff':
    case '.woff2':
    case '.ttf':
    case '.otf':
      return 'font'
    case '.png':
    case '.jpg':
    case '.jpeg':
    case '.webp':
    case '.gif':
    case '.ico':
      return 'image'
    default:
      return 'other'
  }
}

function detectDesignSystem(rel) {
  if (rel.includes('untitledui')) return 'untitledui'
  if (rel.includes('daisyui') || rel.startsWith('styles/components/')) return 'daisyui'
  if (rel.includes('ui-ux-pro-max')) return 'ui-ux-pro-max'
  if (rel.includes('bencium')) return 'bencium'
  return 'local'
}

function detectIndustry(rel, name) {
  const text = (rel + ' ' + name).toLowerCase()
  if (/(payment|billing|credit-card|stripe|currency|bank|invoice|wealth|wallet|visa|mastercard|finance|fintech)/.test(text)) {
    return 'fintech'
  }
  if (/(store|order|cart|checkout|basket|product|inventory|shop|pet-grooming|ecommerce)/.test(text)) {
    return 'ecommerce'
  }
  if (/(landing|pricing|hero|testimonials|blog|contact|footer|cta|lead-harvester|aeo|marketing|banner|faq)/.test(text)) {
    return 'marketing'
  }
  if (/(dashboard|analytics|metrics|rbac|admin|user|subscriber|churn|quota|settings|audit|token|table|chart|saas|app-navigation|cohort|funnel|kpi|bi)/.test(text)) {
    return 'saas'
  }
  if (/(health|medical|clinic|patient|doctor)/.test(text)) {
    return 'healthcare'
  }
  return 'general'
}

function generateTags(rel, name, category, subcategory, industry, designSystem) {
  const parts = rel.toLowerCase().split(/[/\\._-]+/).filter((p) => p.length > 1 && !['com', 'org', 'src', 'lib'].includes(p))
  const nameParts = name.toLowerCase().split(/[-_]+/)
  const set = new Set([...nameParts, ...parts, category, subcategory, industry, designSystem])
  
  if (name.includes('button')) { set.add('action'); set.add('cta'); set.add('click') }
  if (name.includes('input') || name.includes('textarea')) { set.add('form'); set.add('field'); set.add('entry') }
  if (name.includes('table')) { set.add('data-grid'); set.add('rows'); set.add('columns'); set.add('pagination') }
  if (name.includes('chart') || name.includes('gauge') || name.includes('kpi') || name.includes('bi')) {
    set.add('data-viz'); set.add('analytics'); set.add('graph'); set.add('bi'); set.add('metrics')
  }
  if (name.includes('banner')) { set.add('announcement'); set.add('notification'); set.add('promo'); set.add('alert') }
  if (name.includes('hero') || name.includes('feature') || name.includes('pricing') || name.includes('faq')) {
    set.add('section'); set.add('marketing'); set.add('landing')
  }
  if (name.includes('page')) { set.add('full-page'); set.add('screen'); set.add('template') }
  if (name.includes('modal') || name.includes('dialog')) { set.add('popup'); set.add('overlay'); set.add('window') }
  if (name.includes('card')) { set.add('container'); set.add('tile'); set.add('panel') }
  if (name.includes('nav') || name.includes('sidebar') || name.includes('header')) { set.add('menu'); set.add('layout') }
  if (name.includes('icon')) { set.add('glyph'); set.add('symbol'); set.add('vector') }
  if (name.includes('auth') || name.includes('login') || name.includes('signup')) { set.add('session'); set.add('security'); set.add('user') }
  if (name.includes('billing') || name.includes('payment') || name.includes('credit')) { set.add('stripe'); set.add('subscription'); set.add('money') }
  
  return Array.from(set).slice(0, 10)
}

function classifyItem(rel, name) {
  const parts = rel.split('/')
  const top = parts[0]
  let category = top
  let subcategory = 'general'
  let fineType = top

  if (top === 'dashboards') {
    category = 'dashboards'
    subcategory = parts[1] || 'general'
    fineType = `dashboard-${subcategory}`
  } else if (top === 'templates') {
    category = 'templates'
    subcategory = parts[1] || 'general'
    fineType = `template-${subcategory}`
  } else if (top === 'modules') {
    category = 'modules'
    subcategory = parts[1] || 'general'
    fineType = `module-${subcategory}`
  } else if (top === 'design-systems') {
    category = 'design-systems'
    subcategory = parts[1] || 'general'
    fineType = `design-system-${subcategory}`
  } else if (top === 'components' || top === 'styles') {
    category = 'components'
    if (top === 'styles' && parts[1] === 'components') {
      subcategory = 'daisyui-components'
      fineType = 'component-daisyui'
    } else {
      const sec = parts[1]
      const rest = parts.slice(1).join('/')
      if (sec === 'banners') {
        subcategory = 'banners'
        fineType = 'component-banner'
      } else if (sec === 'sections') {
        subcategory = 'sections'
        fineType = 'component-section'
      } else if (sec === 'bi') {
        subcategory = 'bi-analytics'
        fineType = 'component-bi'
      } else if (/button/.test(rest)) {
        subcategory = 'buttons'
        fineType = 'component-button'
      } else if (/input|label|hint|textarea/.test(rest)) {
        subcategory = 'inputs'
        fineType = 'component-input'
      } else if (/dropdown|select|combobox|context-menu/.test(rest)) {
        subcategory = 'dropdowns'
        fineType = 'component-dropdown'
      } else if (/chart|gauge/.test(rest)) {
        subcategory = 'charts'
        fineType = 'component-chart'
      } else if (/nav|sidebar|header/.test(rest)) {
        subcategory = 'navigation'
        fineType = 'component-navigation'
      } else if (/table/.test(rest)) {
        subcategory = 'tables'
        fineType = 'component-table'
      } else if (/modal|dialog|slide/.test(rest)) {
        subcategory = 'modals'
        fineType = 'component-modal'
      } else if (/date|calendar/.test(rest)) {
        subcategory = 'dates'
        fineType = 'component-date'
      } else if (/check|radio|toggle|switch|slider|form/.test(rest)) {
        subcategory = 'forms'
        fineType = 'component-form'
      } else if (/badge|tooltip|progress|alert|loading/.test(rest)) {
        subcategory = 'feedback'
        fineType = 'component-feedback'
      } else if (/card/.test(rest)) {
        subcategory = 'cards'
        fineType = 'component-card'
      } else if (/carousel/.test(rest)) {
        subcategory = 'carousel'
        fineType = 'component-carousel'
      } else if (/empty/.test(rest)) {
        subcategory = 'empty-state'
        fineType = 'component-empty-state'
      } else if (/avatar/.test(rest)) {
        subcategory = 'avatar'
        fineType = 'component-avatar'
      } else if (/marketing|blog|contact|pricing|footer|login|signup/.test(rest)) {
        subcategory = 'marketing'
        fineType = 'component-marketing'
      } else {
        subcategory = sec || 'primitives'
        fineType = `component-${subcategory}`
      }
    }
  } else if (top === 'assets') {
    category = 'assets'
    const sub = parts[1] || 'misc'
    if (sub === 'icons') {
      subcategory = 'icons-untitledui'
      fineType = 'asset-icons'
    } else if (sub === 'logos') {
      if (rel.includes('payment')) subcategory = 'logos-payment'
      else if (rel.includes('social')) subcategory = 'logos-social'
      else if (rel.includes('integration')) subcategory = 'logos-integration'
      else subcategory = 'logos-brand'
      fineType = `asset-${subcategory}`
    } else if (sub === 'illustrations') {
      subcategory = 'illustrations'
      fineType = 'asset-illustrations'
    } else if (sub === 'fonts') {
      subcategory = 'fonts'
      fineType = 'asset-fonts'
    } else {
      subcategory = sub
      fineType = `asset-${sub}`
    }
  } else if (top === 'tokens') {
    category = 'tokens'
    if (parts[1] === 'themes') subcategory = 'daisyui-themes'
    else if (parts[1] === 'colors') subcategory = 'daisyui-colors'
    else if (parts[1] === 'untitledui') subcategory = 'untitledui-tokens'
    else subcategory = 'brand-tokens'
    fineType = `token-${subcategory}`
  } else if (top === 'schemas') {
    category = 'schemas'
    subcategory = parts[1] || 'general'
    fineType = `schema-${subcategory}`
  } else if (top === 'design-trends') {
    category = 'design-trends'
    subcategory = parts[1] || 'trends'
    fineType = 'design-trend'
  } else {
    category = top
    subcategory = parts[1] || 'general'
    fineType = `${top}-${subcategory}`
  }

  return { category, subcategory, fineType }
}

function addItem(rawType, name, file, extra = {}) {
  const rel = file.split(path.sep).join('/')
  const { category, subcategory, fineType } = classifyItem(rel, name)
  const language = detectLanguage(rel)
  const designSystem = detectDesignSystem(rel)
  const industry = detectIndustry(rel, name)
  const source = extra.source || (designSystem !== 'local' ? designSystem : 'local')
  const license = extra.license || LICENSE
  const tags = generateTags(rel, name, category, subcategory, industry, designSystem)

  items.push({
    type: fineType,
    category,
    subcategory,
    name,
    path: rel,
    language,
    industry,
    designSystem,
    source,
    license,
    tags,
    ...extra
  })
}

// 1. DaisyUI components
for (const c of fs.readdirSync('styles/components', { withFileTypes: true })) {
  if (!c.isDirectory()) continue
  const cssFile = path.join('styles/components', c.name, `${c.name}.css`)
  const ex = path.join('styles/components', c.name, `${c.name}.example.html`)
  const extra = { source: 'daisyui@5.7.50' }
  if (fs.existsSync(ex)) extra.example = ex.split(path.sep).join('/')
  addItem('component', c.name, cssFile, extra)
}

// 2. Base styles and utilities
const flat = (dir) => {
  if (!fs.existsSync(dir)) return
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith('.css')) addItem('style', path.basename(f, '.css'), path.join(dir, f), { source: 'daisyui@5.7.50' })
  }
}
flat('styles/base')
flat('styles/utilities')
flat('tokens/themes')
flat('tokens/colors')

// 3. Design trends
for (const t of fs.readdirSync('design-trends', { withFileTypes: true })) {
  if (!t.isDirectory()) continue
  const dir = path.join('design-trends', t.name)
  const f = (suffix) => path.join(dir, `${t.name}${suffix}`).split(path.sep).join('/')
  const extra = {
    demo: f('.demo.html'),
    demoCss: f('.demo.css'),
    screenshot: fs.readdirSync(dir).map((n) => `${dir}/${n}`.split(path.sep).join('/')).find((n) => n.includes('.screenshot.')),
    source: 'trends.daisyui.com',
  }
  addItem('design-trend', t.name, f('.md'), extra)
}

// 4. Scan all library folders including banners, sections, bi
const SCAN_DIRS = [
  'dashboards', 'modules', 'templates', 'design-systems',
  'components/banners', 'components/sections', 'components/bi',
  'components/ui', 'components/common', 'components/layout', 'components/patterns',
  'assets', 'tokens', 'schemas', 'functions', 'utils', 'hooks', 'lib', 'scripts', 'snippets',
  'constants', 'types', 'providers', 'data', 'design-systems', 'skills', 'examples', 'docs', 'vendor'
]

const known = new Set(items.map((i) => i.path))
known.add('tokens/tokens.css')
known.add('tokens/brand-theme.css')

const walk = (dir) => {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    return e.isDirectory() ? walk(p) : [p]
  })
}

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const rel = file.split(path.sep).join('/')
    if (['.gitkeep', 'package.json', 'package-lock.json', 'bun.lock', 'pnpm-lock.yaml'].includes(path.basename(file)) || known.has(rel)) continue
    const name = rel.slice(dir.length + 1)
    addItem(dir.replace('/', '-'), name, file)
    known.add(rel)
  }
}

// 5. Config and tokens roots
addItem('config', 'brand', 'config/brand.ts', { source: 'local' })
addItem('token', 'tokens', 'tokens/tokens.css', { source: 'local' })
addItem('theme', 'brand', 'tokens/brand-theme.css', { source: 'local' })
addItem('entry', 'index', 'styles/index.css', { source: 'local' })

// 6. Write themes list for CSS
const themeNames = [...items.filter((i) => i.subcategory === 'daisyui-themes' || i.type === 'theme').map((i) => i.name), 'brand', 'brand-dark']
fs.writeFileSync(
  'tokens/themes/index.ts',
  `/** Every theme name usable in data-theme. Generated by scripts/build-catalog.mjs. */
export const themeNames = ${JSON.stringify([...new Set(themeNames)])} as const

export type ThemeName = (typeof themeNames)[number]
`,
)

// 7. Write main catalog.json
fs.writeFileSync('registry/catalog.json', JSON.stringify({ version: 2, count: items.length, items }, null, 2))

// 8. Write AI Agent Partitioned Indexes
function ensure(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }) }

const byCatDir = 'registry/by-category'
const byIndDir = 'registry/by-industry'
ensure(byCatDir)
ensure(byIndDir)

// Group by category
const catGroups = {}
for (const i of items) {
  if (!catGroups[i.category]) catGroups[i.category] = []
  catGroups[i.category].push(i)
}

for (const [cat, catItems] of Object.entries(catGroups)) {
  if (cat === 'assets') {
    const icons = catItems.filter((i) => i.subcategory === 'icons-untitledui')
    const logos = catItems.filter((i) => i.subcategory.startsWith('logos'))
    const illustrations = catItems.filter((i) => i.subcategory === 'illustrations')
    const fonts = catItems.filter((i) => i.subcategory === 'fonts')
    const others = catItems.filter((i) => !['icons-untitledui', 'illustrations', 'fonts'].includes(i.subcategory) && !i.subcategory.startsWith('logos'))

    fs.writeFileSync(path.join(byCatDir, 'assets-icons.json'), JSON.stringify({ count: icons.length, items: icons.map(i => ({ name: i.name, path: i.path, tags: i.tags })) }, null, 2))
    fs.writeFileSync(path.join(byCatDir, 'assets-logos.json'), JSON.stringify({ count: logos.length, items: logos }, null, 2))
    fs.writeFileSync(path.join(byCatDir, 'assets-illustrations.json'), JSON.stringify({ count: illustrations.length, items: illustrations }, null, 2))
    fs.writeFileSync(path.join(byCatDir, 'assets-fonts.json'), JSON.stringify({ count: fonts.length, items: fonts }, null, 2))
    fs.writeFileSync(path.join(byCatDir, 'assets-misc.json'), JSON.stringify({ count: others.length, items: others }, null, 2))
  } else {
    fs.writeFileSync(path.join(byCatDir, `${cat}.json`), JSON.stringify({ count: catItems.length, items: catItems }, null, 2))
  }
}

// Write specialized indexes for rapid AI lookup
const bannersList = items.filter((i) => i.subcategory === 'banners')
const sectionsList = items.filter((i) => i.subcategory === 'sections')
const biList = items.filter((i) => i.subcategory === 'bi-analytics' || i.subcategory === 'charts')
const pagesList = items.filter((i) => i.subcategory === 'pages' || i.category === 'dashboards')

fs.writeFileSync(path.join(byCatDir, 'banners.json'), JSON.stringify({ count: bannersList.length, items: bannersList }, null, 2))
fs.writeFileSync(path.join(byCatDir, 'sections.json'), JSON.stringify({ count: sectionsList.length, items: sectionsList }, null, 2))
fs.writeFileSync(path.join(byCatDir, 'bi-components.json'), JSON.stringify({ count: biList.length, items: biList }, null, 2))
fs.writeFileSync(path.join(byCatDir, 'pages.json'), JSON.stringify({ count: pagesList.length, items: pagesList }, null, 2))

// Group by industry
const indGroups = {}
for (const i of items) {
  if (!indGroups[i.industry]) indGroups[i.industry] = []
  indGroups[i.industry].push(i)
}
for (const [ind, indItems] of Object.entries(indGroups)) {
  fs.writeFileSync(path.join(byIndDir, `${ind}.json`), JSON.stringify({ count: indItems.length, items: indItems }, null, 2))
}

// 9. Quick Lookup Map for Instant O(1) searches
const quickLookup = {}
for (const i of items) {
  quickLookup[i.name] = {
    p: i.path,
    c: i.category,
    s: i.subcategory,
    l: i.language,
    i: i.industry,
    ds: i.designSystem,
    tags: i.tags
  }
}
fs.writeFileSync('registry/quick-lookup.json', JSON.stringify(quickLookup))

// 10. Generate compact LLM Sitemap (registry/INDEX.md)
const sitemapMd = `# Library Catalog Map (AI Agent Guide)

Total Items: **${items.length}** | Fine-Grained Groups: **${Object.keys(catGroups).length}**

## How to Find Any Item Fast
Run the instant search CLI in your terminal:
\`\`\`bash
npm run find -- <query>
npm run find -- --category <dashboards|modules|components|templates|tokens|assets>
npm run find -- --industry <saas|fintech|ecommerce|marketing>
\`\`\`

## Partitioned Indexes (Small, Fast to Read)
When you only need a specific domain, read its lightweight partitioned index file in \`registry/by-category/\`:
- \`registry/by-category/banners.json\` (${bannersList.length} banner items)
- \`registry/by-category/sections.json\` (${sectionsList.length} section items)
- \`registry/by-category/bi-components.json\` (${biList.length} BI & chart items)
- \`registry/by-category/pages.json\` (${pagesList.length} full-page templates)
- \`registry/by-category/dashboards.json\` (${catGroups.dashboards?.length || 0} items)
- \`registry/by-category/modules.json\` (${catGroups.modules?.length || 0} items)
- \`registry/by-category/components.json\` (${catGroups.components?.length || 0} items)
- \`registry/by-category/templates.json\` (${catGroups.templates?.length || 0} items)
- \`registry/by-category/tokens.json\` (${catGroups.tokens?.length || 0} items)
- \`registry/by-category/schemas.json\` (${catGroups.schemas?.length || 0} items)
- \`registry/by-category/design-systems.json\` (${catGroups['design-systems']?.length || 0} items)
- \`registry/by-category/assets-logos.json\` (${items.filter(i=>i.subcategory?.startsWith('logos')).length} items)
- \`registry/by-category/assets-illustrations.json\` (${items.filter(i=>i.subcategory==='illustrations').length} items)
- \`registry/by-category/assets-icons.json\` (${items.filter(i=>i.subcategory==='icons-untitledui').length} items)

## Partitioned Indexes by Industry
- \`registry/by-industry/saas.json\` (${indGroups.saas?.length || 0} items)
- \`registry/by-industry/fintech.json\` (${indGroups.fintech?.length || 0} items)
- \`registry/by-industry/ecommerce.json\` (${indGroups.ecommerce?.length || 0} items)
- \`registry/by-industry/marketing.json\` (${indGroups.marketing?.length || 0} items)

## Top Category Summary
${Object.entries(catGroups).map(([c, list]) => `- **${c}**: ${list.length} items (Subcategories: ${[...new Set(list.map(i => i.subcategory))].slice(0, 5).join(', ')})`).join('\n')}
`
fs.writeFileSync('registry/INDEX.md', sitemapMd)

console.log('--- BUILD CATALOG COMPLETE ---')
console.log('Total items:', items.length)
console.log('Specialized partitioned indexes: banners (' + bannersList.length + '), sections (' + sectionsList.length + '), BI (' + biList.length + '), pages (' + pagesList.length + ')')
