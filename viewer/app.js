const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]
const app = $('#app')

function storeGet(k) { try { return localStorage.getItem(k) } catch { return null } }
function storeSet(k, v) { try { localStorage.setItem(k, v) } catch {} }

const state = {
  items: [],
  themes: [],
  theme: storeGet('theme') || 'brand',
  q: '',
  groupBy: storeGet('groupBy') || 'category',
  filterLang: '',
  filterIndustry: '',
  filterDs: '',
  filterSub: '',
  limit: 48
}
const PAGE = 48
const isTheme = (i) => i.subcategory === 'daisyui-themes' && i.path.startsWith('tokens/themes/') && !i.path.endsWith('index.ts')

const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const ext = (p) => p.slice(p.lastIndexOf('.') + 1).toLowerCase()
const IMG = ['svg', 'png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'ico']
const FONT = ['ttf', 'otf', 'woff', 'woff2']
const BIN = ['ttf', 'otf', 'woff', 'woff2', 'pdf', 'zip', 'gz', 'ico']

const plural = (w, n) => (n === 1 ? w : /y$/.test(w) ? `${w.slice(0, -1)}ies` : /s$/.test(w) ? w : `${w}s`)
const label = (t) => {
  if (!t) return ''
  return t.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const preview = (path) => `/preview?path=${encodeURIComponent(path)}&theme=${encodeURIComponent(state.theme)}`
const previewPath = (i) => i.example || (i.type !== 'component' && ext(i.path) === 'html' ? i.path : null)

async function load() {
  const [cat, themeTs] = await Promise.all([
    fetch('/registry/catalog.json', { cache: 'no-store' }).then((r) => r.json()),
    fetch('/tokens/themes/index.ts', { cache: 'no-store' }).then((r) => r.text()),
  ])
  state.items = cat.items || []
  const m = themeTs.match(/themeNames = (\[.*?\])/s)
  state.themes = m ? JSON.parse(m[1]) : []
  fillFilters()
  $('#theme').innerHTML = state.themes.map((t) => `<option ${t === state.theme ? 'selected' : ''}>${esc(t)}</option>`).join('')
}

function fillFilters() {
  const opts = (key, id, all) => {
    const counts = {}
    for (const i of state.items) counts[i[key]] = (counts[i[key]] || 0) + 1
    const cur = state[id]
    $(`#filter-${all.id}`).innerHTML = `<option value="">${all.label}</option>` + Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([v, n]) => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${esc(label(v))} (${n})</option>`).join('')
  }
  opts('language', 'filterLang', { id: 'lang', label: 'All Languages' })
  opts('industry', 'filterIndustry', { id: 'industry', label: 'All Industries' })
  opts('designSystem', 'filterDs', { id: 'ds', label: 'All Systems' })
}

const getGroupVal = (i, groupKey) => {
  return i[groupKey] || 'other'
}

const match = (i) => {
  if (state.filterLang && i.language !== state.filterLang) return false
  if (state.filterIndustry && i.industry !== state.filterIndustry) return false
  if (state.filterDs && i.designSystem !== state.filterDs) return false
  if (state.filterSub && i.subcategory !== state.filterSub) return false
  if (!state.q) return true
  const haystack = `${i.name} ${i.type} ${i.category} ${i.subcategory} ${i.language} ${i.industry} ${i.designSystem} ${i.path}`.toLowerCase()
  return haystack.includes(state.q)
}

function filteredItems() {
  return state.items.filter(match)
}

function overview() {
  if (state.q) return list(null, null)
  const items = filteredItems()
  const groupKey = state.groupBy
  const groups = {}
  for (const i of items) {
    const val = getGroupVal(i, groupKey)
    groups[val] = (groups[val] || 0) + 1
  }

  const sortedGroups = Object.entries(groups).sort((a, b) => b[1] - a[1])

  app.innerHTML = `
    <div class="mb-6 flex flex-wrap items-baseline justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">${items.length} items in ${sortedGroups.length} ${plural(label(groupKey), sortedGroups.length)}</h1>
        <p class="text-sm opacity-70 mt-1">Grouped by <strong>${label(groupKey)}</strong>. Click any card to explore items.</p>
      </div>
      <div class="text-xs opacity-60">Total Library Items: ${state.items.length}</div>
    </div>
    <div class="grid grid-cols-2 gap-3 fold:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      ${sortedGroups.map(([grp, count]) => `
        <a href="#/${esc(groupKey)}/${encodeURIComponent(grp)}" class="card bg-base-100 p-4 transition hover:shadow-md border border-base-200 hover:border-primary/40">
          <div class="text-3xl font-extrabold text-primary">${count}</div>
          <div class="font-medium mt-1 truncate" title="${esc(grp)}">${esc(label(grp))}</div>
        </a>
      `).join('')}
    </div>`
}

const fontFamily = (i) => `lib-${i.path.replace(/[^a-z0-9]/gi, '-')}`
function fontFace() {
  const css = state.items.filter((i) => FONT.includes(ext(i.path))).map((i) => `@font-face{font-family:'${fontFamily(i)}';src:url('/${i.path}')}`).join('')
  let el = document.getElementById('lib-fonts')
  if (!el) { el = document.createElement('style'); el.id = 'lib-fonts'; document.head.append(el) }
  el.textContent = css
}

function thumb(i) {
  const pp = previewPath(i)
  if (isTheme(i)) {
    const name = i.name
    return `<div data-theme="${esc(name)}" class="flex h-36 flex-col justify-between bg-base-100 p-3"><div class="flex gap-1"><span class="badge badge-primary"></span><span class="badge badge-secondary"></span><span class="badge badge-accent"></span><span class="badge badge-neutral"></span></div><span class="btn btn-primary btn-sm w-fit">${esc(name)}</span></div>`
  }
  if (i.screenshot) return `<img loading="lazy" src="/${esc(i.screenshot)}" alt="" class="h-36 w-full object-cover object-top">`
  if (pp) return `<iframe loading="lazy" scrolling="no" tabindex="-1" src="${preview(pp)}" class="pointer-events-none h-36 w-full border-0"></iframe>`
  if (IMG.includes(ext(i.path))) return `<img loading="lazy" src="/${esc(i.path)}" alt="" class="h-36 w-full bg-base-200 object-contain p-3">`
  if (FONT.includes(ext(i.path))) return `<div class="grid h-36 place-items-center bg-base-200 text-4xl" style="font-family:'${fontFamily(i)}'">Aa</div>`
  return `<div class="grid h-36 place-items-center bg-base-200 font-mono text-xs opacity-60">.${esc(ext(i.path))}</div>`
}

const langBadgeColor = {
  typescript: 'badge-primary',
  javascript: 'badge-warning',
  css: 'badge-secondary',
  html: 'badge-accent',
  svg: 'badge-info',
  json: 'badge-success',
  markdown: 'badge-neutral',
  python: 'badge-primary'
}

function badges(i) {
  const b = []
  if (i.language) b.push(`<span class="badge badge-xs ${langBadgeColor[i.language] || 'badge-ghost'}">${esc(i.language)}</span>`)
  if (i.industry && i.industry !== 'general') b.push(`<span class="badge badge-xs badge-outline">${esc(i.industry)}</span>`)
  if (i.designSystem && i.designSystem !== 'local') b.push(`<span class="badge badge-xs badge-ghost opacity-70">${esc(i.designSystem)}</span>`)
  return b.join(' ')
}

// A design system is a folder (design-systems/<source>/<name>/...), not a file: show one card per system.
const unitKey = (i) => {
  const p = i.path.split('/')
  return i.category === 'design-systems' && p.length >= 4 ? p.slice(0, 3).join('/') : null
}
const REP = ['DESIGN.md', 'components.html', 'README.md']
function collapse(items) {
  const units = new Map()
  const out = []
  for (const i of items) {
    const k = unitKey(i)
    if (!k) { out.push(i); continue }
    let u = units.get(k)
    if (!u) { u = { rep: i, count: 0 }; units.set(k, u); out.push(u) }
    u.count++
    const rank = (x) => { const r = REP.indexOf(x.path.split('/').pop()); return r < 0 ? 99 : r }
    if (rank(i) < rank(u.rep)) u.rep = i
  }
  return out.map((x) => (x.rep ? { ...x.rep, _count: x.count } : x))
}

function list(groupKey, groupVal) {
  let items = filteredItems()
  if (groupKey && groupVal) {
    items = items.filter((i) => getGroupVal(i, groupKey) === groupVal)
  }

  items = collapse(items)
  const subs = {}
  for (const i of items) subs[i.subcategory] = (subs[i.subcategory] || 0) + 1
  const chips = Object.keys(subs).length > 1 && Object.keys(subs).length <= 40
    ? `<div class="mb-4 flex flex-wrap gap-1">${Object.entries(subs).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<button data-sub="${esc(k)}" class="badge ${state.filterSub === k ? 'badge-primary' : 'badge-outline'} cursor-pointer">${esc(k)} ${n}</button>`).join('')}</div>`
    : ''
  const shown = items.slice(0, state.limit)
  const title = groupVal ? `${label(groupKey)}: ${label(groupVal)}` : 'Search Results'

  app.innerHTML = `
    <div class="mb-4 flex flex-wrap items-baseline gap-2">
      <a href="#/" class="link font-semibold">Library</a>
      <span class="opacity-40">/</span>
      <h1 class="text-xl font-bold">${esc(title)}</h1>
      <span class="badge badge-sm badge-neutral ml-2">${items.length}</span>
    </div>
    ${chips}
    ${items.length ? '' : '<div class="p-8 text-center opacity-60 bg-base-100 rounded-box border border-base-300">No items match the current filters.</div>'}
    <div class="grid grid-cols-1 gap-4 fold:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      ${shown.map((i) => `
        <a href="#/item/${encodeURIComponent(i.path)}" class="card overflow-hidden bg-base-100 border border-base-200 transition hover:shadow-md hover:border-primary/40">
          <figure class="overflow-hidden bg-base-200/50">${thumb(i)}</figure>
          <div class="p-3">
            <div class="truncate font-semibold text-sm" title="${esc(i.name)}">${esc(i.name)}</div>
            <div class="flex flex-wrap gap-1 mt-2">${i._count > 1 ? `<span class="badge badge-xs badge-primary">${i._count} files</span>` : ''}${badges(i)}</div>
            <div class="text-[11px] opacity-50 mt-1 truncate font-mono">${esc(i.path)}</div>
          </div>
        </a>
      `).join('')}
    </div>
    ${items.length > shown.length ? `<div class="mt-6 text-center"><button id="more" class="btn btn-sm">Show more (${items.length - shown.length} left)</button></div>` : ''}`
  $$('[data-sub]').forEach((b) => b.addEventListener('click', () => { state.filterSub = state.filterSub === b.dataset.sub ? '' : b.dataset.sub; state.limit = PAGE; list(groupKey, groupVal) }))
  const more = $('#more')
  if (more) more.addEventListener('click', () => { state.limit += PAGE; const y = scrollY; list(groupKey, groupVal); scrollTo(0, y) })
}

const md = (s) => esc(s)
  .replace(/^&lt;!-- .*--&gt;$/gm, '')
  .replace(/^#### (.*)$/gm, '<h4 class="mt-4 font-semibold">$1</h4>')
  .replace(/^### (.*)$/gm, '<h3 class="mt-5 text-lg font-semibold">$1</h3>')
  .replace(/^## (.*)$/gm, '<h2 class="mt-6 text-xl font-semibold">$1</h2>')
  .replace(/^# (.*)$/gm, '<h1 class="text-2xl font-semibold">$1</h1>')
  .replace(/^- (.*)$/gm, '<li class="ml-5 list-disc">$1</li>')
  .replace(/\n\n/g, '<br>')

async function detail(itemPath) {
  const i = state.items.find((x) => x.path === itemPath)
  if (!i) { app.innerHTML = '<p class="p-8">Item not found.</p>'; return }

  const crumbs = `
    <div class="mb-4 flex flex-wrap items-baseline gap-2 text-sm">
      <a href="#/" class="link font-semibold">Library</a>
      <span class="opacity-40">/</span>
      <a href="#/category/${encodeURIComponent(i.category)}" class="link">${esc(label(i.category))}</a>
      <span class="opacity-40">/</span>
      <span class="opacity-70">${esc(i.subcategory)}</span>
      <span class="opacity-40">/</span>
      <h1 class="text-lg font-bold truncate max-w-md">${esc(i.name)}</h1>
    </div>`

  const metaPills = `
    <div class="flex flex-wrap gap-2 mb-6">
      <span class="badge badge-sm badge-primary">${esc(i.language)}</span>
      <span class="badge badge-sm badge-secondary">${esc(i.category)}</span>
      <span class="badge badge-sm badge-accent">${esc(i.subcategory)}</span>
      <span class="badge badge-sm badge-outline">Industry: ${esc(i.industry)}</span>
      <span class="badge badge-sm badge-ghost">System: ${esc(i.designSystem)}</span>
      <span class="badge badge-sm badge-neutral">Source: ${esc(i.source)}</span>
      ${i.license ? `<span class="badge badge-sm badge-ghost">License: ${esc(i.license)}</span>` : ''}
    </div>`

  const unit = unitKey(i)
  const siblings = unit ? state.items.filter((x) => x.path.startsWith(`${unit}/`)) : []
  const files = siblings.length > 1
    ? `<div class="mb-4 flex flex-wrap gap-1">${siblings.map((x) => `<a href="#/item/${encodeURIComponent(x.path)}" class="badge ${x.path === i.path ? 'badge-primary' : 'badge-outline'}">${esc(x.path.slice(unit.length + 1))}</a>`).join('')}</div>`
    : ''
  const pp = previewPath(i)
  const isImg = IMG.includes(ext(i.path))
  const text = isImg || BIN.includes(ext(i.path)) ? null : await fetch(`/${i.path}`, { cache: 'no-store' }).then((r) => r.text())
  let main = ''

  if (i.type === 'design-trend') {
    main = `<div class="grid gap-6 xl:grid-cols-[2fr_1fr]"><iframe src="/${esc(i.demo)}" class="h-[75vh] w-full rounded-box border border-base-300 bg-base-100"></iframe><article class="max-h-[75vh] overflow-auto text-sm bg-base-100 p-6 rounded-box">${md(text)}</article></div>`
  } else if (isTheme(i)) {
    const vars = [...(text || '').matchAll(/--(color-[a-z0-9-]+):\s*([^;]+);/g)]
    const partner = (k) => (k.endsWith('-content') ? k.replace('-content', '') : `${k}-content`)
    main = `<div data-theme="${esc(i.name)}" class="space-y-4 rounded-box bg-base-100 p-6 text-base-content"><div class="grid grid-cols-2 gap-2 fold:grid-cols-3 lg:grid-cols-5">${vars.map(([, k, v]) => `<div class="rounded-field border border-base-300 p-3 text-xs" style="background:var(--${k});color:var(--${partner(k)},inherit)"><div class="font-semibold">${esc(k)}</div><div class="opacity-80">${esc(v)}</div></div>`).join('')}</div><div class="flex flex-wrap gap-2"><button class="btn btn-primary">Primary</button><button class="btn btn-secondary">Secondary</button><button class="btn btn-accent">Accent</button></div></div>`
  } else if (i.language === 'markdown' && text) {
    main = `<article class="max-h-[75vh] overflow-auto rounded-box border border-base-300 bg-base-100 p-6 text-sm">${md(text)}</article>`
  } else if (pp) {
    main = `<iframe src="${preview(pp)}" class="h-[75vh] w-full rounded-box border border-base-300 bg-base-100"></iframe>`
  } else if (isImg) {
    main = `<div class="grid place-items-center rounded-box bg-base-100 p-8 border border-base-300"><img src="/${esc(i.path)}" alt="${esc(i.name)}" class="max-h-[60vh] max-w-full"></div>`
  }

  if (FONT.includes(ext(i.path))) {
    main = `<div class="space-y-4 rounded-box bg-base-100 p-6 border border-base-300" style="font-family:'${fontFamily(i)}'"><p class="text-6xl">Aa Bb Cc 123</p><p class="text-3xl">The quick brown fox jumps over the lazy dog</p><p class="text-base">ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789</p></div><a class="btn mt-3 btn-sm" href="/${esc(i.path)}" download>Download font</a>`
  } else if (text === null && !isImg) {
    main = `<a class="btn btn-primary btn-sm" href="/${esc(i.path)}" download>Download ${esc(i.name)}</a>`
  }

  const code = text !== null && i.type !== 'design-trend'
    ? `<div class="collapse collapse-arrow mt-4 bg-base-100 border border-base-300"><input type="checkbox" checked><div class="collapse-title font-medium text-sm">Source Code (${esc(ext(i.path))})</div><div class="collapse-content"><pre class="max-h-[60vh] overflow-auto text-xs font-mono p-4 bg-base-200/50 rounded">${esc(text)}</pre></div></div>`
    : ''

  app.innerHTML = crumbs + metaPills + files + main + code
}

async function route() {
  const hash = location.hash.replace(/^#\/?/, '')
  const parts = hash.split('/').filter(Boolean)
  if (!parts.length) return overview()

  if (parts[0] === 'item' && parts[1]) {
    return detail(decodeURIComponent(parts.slice(1).join('/')))
  }

  if (parts.length >= 2) {
    const groupKey = parts[0]
    const groupVal = decodeURIComponent(parts.slice(1).join('/'))
    return list(groupKey, groupVal)
  }

  if (parts.length === 1) {
    // legacy or direct type
    return list('category', decodeURIComponent(parts[0]))
  }

  return overview()
}

// Group Tabs
$$('#group-tabs button').forEach((btn) => {
  btn.addEventListener('click', () => {
    $$('#group-tabs button').forEach((b) => {
      b.classList.remove('bg-base-100', 'shadow-sm', 'font-semibold')
      b.classList.add('hover:bg-base-100/50')
    })
    btn.classList.add('bg-base-100', 'shadow-sm', 'font-semibold')
    btn.classList.remove('hover:bg-base-100/50')
    state.groupBy = btn.dataset.group
    storeSet('groupBy', state.groupBy)
    location.hash = '#/'
    overview()
  })
})

// Quick Filters
$('#filter-lang').addEventListener('change', (e) => { state.filterLang = e.target.value; route() })
$('#filter-industry').addEventListener('change', (e) => { state.filterIndustry = e.target.value; route() })
$('#filter-ds').addEventListener('change', (e) => { state.filterDs = e.target.value; route() })

$('#search').addEventListener('input', (e) => {
  state.q = e.target.value.trim().toLowerCase()
  state.limit = PAGE
  if (state.q) list(null, null)
  else route()
})

$('#theme').addEventListener('change', (e) => {
  state.theme = e.target.value
  storeSet('theme', state.theme)
  document.documentElement.dataset.theme = state.theme
  route()
})

addEventListener('hashchange', () => { state.filterSub = ''; state.limit = PAGE; route() })

async function start() {
  await load()
  document.documentElement.dataset.theme = state.theme
  fontFace()
  // sync group tab active state
  $$('#group-tabs button').forEach((b) => {
    if (b.dataset.group === state.groupBy) {
      b.classList.add('bg-base-100', 'shadow-sm', 'font-semibold')
      b.classList.remove('hover:bg-base-100/50')
    } else {
      b.classList.remove('bg-base-100', 'shadow-sm', 'font-semibold')
      b.classList.add('hover:bg-base-100/50')
    }
  })
  route()
}
start()

const es = new EventSource('/events')
es.onmessage = () => { location.reload() }
es.onerror = () => { $('#live').className = 'status status-error' }
es.onopen = () => { $('#live').className = 'status status-success' }
