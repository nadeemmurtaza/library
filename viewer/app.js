const $ = (s, el = document) => el.querySelector(s)
const app = $('#app')

function storeGet(k) { try { return localStorage.getItem(k) } catch { return null } }
function storeSet(k, v) { try { localStorage.setItem(k, v) } catch {} }

const state = { items: [], themes: [], theme: storeGet('theme') || 'brand', q: '' }

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const ext = (p) => p.slice(p.lastIndexOf('.') + 1).toLowerCase()
const IMG = ['svg', 'png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'ico']
const FONT = ['ttf', 'otf', 'woff', 'woff2']
const BIN = ['ttf', 'otf', 'woff', 'woff2', 'pdf', 'zip', 'gz', 'ico']
const ORDER = ['component', 'design-trend', 'theme', 'color', 'base', 'utility', 'token', 'config', 'entry']
const LABEL = { component: 'Components', 'design-trend': 'Design trends', theme: 'Themes', color: 'Colors', base: 'Base', utility: 'Utilities', token: 'Tokens', config: 'Config', entry: 'Entry' }
const label = (t) => LABEL[t] || t.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase())
const preview = (path) => `/preview?path=${encodeURIComponent(path)}&theme=${encodeURIComponent(state.theme)}`
const previewPath = (i) => i.example || (i.type !== 'component' && ext(i.path) === 'html' ? i.path : null)

async function load() {
  const [cat, themeTs] = await Promise.all([
    fetch('/registry/catalog.json', { cache: 'no-store' }).then((r) => r.json()),
    fetch('/tokens/themes/index.ts', { cache: 'no-store' }).then((r) => r.text()),
  ])
  state.items = cat.items
  const m = themeTs.match(/themeNames = (\[.*?\])/s)
  state.themes = m ? JSON.parse(m[1]) : []
  $('#theme').innerHTML = state.themes.map((t) => `<option ${t === state.theme ? 'selected' : ''}>${esc(t)}</option>`).join('')
}

const types = () => {
  const t = [...new Set(state.items.map((i) => i.type))]
  return t.sort((a, b) => (ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99) || a.localeCompare(b))
}
const match = (i) => !state.q || `${i.type} ${i.name}`.toLowerCase().includes(state.q)

function overview() {
  if (state.q) return list(null)
  app.innerHTML = `
    <h1 class="text-2xl font-semibold">${state.items.length} items in ${types().length} groups</h1>
    <p class="mb-6 opacity-70">Pick a group. New files appear here on their own.</p>
    <div class="grid grid-cols-2 gap-3 fold:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      ${types().map((t) => `<a href="#/${esc(t)}" class="card bg-base-100 p-4 transition hover:shadow-md"><div class="text-3xl font-semibold">${state.items.filter((i) => i.type === t).length}</div><div class="opacity-70">${esc(label(t))}</div></a>`).join('')}
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
  if (i.type === 'theme') {
    const name = i.name
    return `<div data-theme="${esc(name)}" class="flex h-40 flex-col justify-between bg-base-100 p-3"><div class="flex gap-1"><span class="badge badge-primary"></span><span class="badge badge-secondary"></span><span class="badge badge-accent"></span><span class="badge badge-neutral"></span></div><span class="btn btn-primary btn-sm w-fit">${esc(name)}</span></div>`
  }
  if (i.screenshot) return `<img loading="lazy" src="/${esc(i.screenshot)}" alt="" class="h-40 w-full object-cover object-top">`
  if (pp) return `<iframe loading="lazy" scrolling="no" tabindex="-1" src="${preview(pp)}" class="pointer-events-none h-40 w-full border-0"></iframe>`
  if (IMG.includes(ext(i.path))) return `<img loading="lazy" src="/${esc(i.path)}" alt="" class="h-40 w-full bg-base-200 object-contain p-4">`
  if (FONT.includes(ext(i.path))) return `<div class="grid h-40 place-items-center bg-base-200 text-5xl" style="font-family:'${fontFamily(i)}'">Aa</div>`
  return `<div class="grid h-40 place-items-center bg-base-200 font-mono text-sm opacity-60">.${esc(ext(i.path))}</div>`
}

function list(type) {
  const items = state.items.filter((i) => (!type || i.type === type) && match(i))
  app.innerHTML = `
    <div class="mb-4 flex items-baseline gap-3"><a href="#/" class="link">Library</a><span>/</span><h1 class="text-xl font-semibold">${esc(type ? label(type) : 'Search')}</h1><span class="opacity-60">${items.length}</span></div>
    ${items.length ? '' : '<p class="opacity-60">Nothing here yet.</p>'}
    <div class="grid grid-cols-1 gap-4 fold:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      ${items.map((i) => `<a href="#/${esc(i.type)}/${encodeURIComponent(i.name)}" class="card overflow-hidden bg-base-100 transition hover:shadow-md"><figure class="overflow-hidden">${thumb(i)}</figure><div class="p-3"><div class="truncate font-medium">${esc(i.name)}</div>${type ? '' : `<div class="text-xs opacity-60">${esc(label(i.type))}</div>`}</div></a>`).join('')}
    </div>`
}

const md = (s) => esc(s)
  .replace(/^&lt;!-- .*--&gt;$/gm, '')
  .replace(/^#### (.*)$/gm, '<h4 class="mt-4 font-semibold">$1</h4>')
  .replace(/^### (.*)$/gm, '<h3 class="mt-5 text-lg font-semibold">$1</h3>')
  .replace(/^## (.*)$/gm, '<h2 class="mt-6 text-xl font-semibold">$1</h2>')
  .replace(/^# (.*)$/gm, '<h1 class="text-2xl font-semibold">$1</h1>')
  .replace(/^- (.*)$/gm, '<li class="ml-5 list-disc">$1</li>')
  .replace(/\n\n/g, '<br>')

async function detail(type, name) {
  const i = state.items.find((x) => x.type === type && x.name === name)
  if (!i) { app.innerHTML = '<p>Not found.</p>'; return }
  const crumbs = `<div class="mb-4 flex flex-wrap items-baseline gap-2"><a href="#/" class="link">Library</a><span>/</span><a href="#/${esc(type)}" class="link">${esc(type ? label(type) : '')}</a><span>/</span><h1 class="text-xl font-semibold">${esc(name)}</h1></div>`
  const pp = previewPath(i)
  const isImg = IMG.includes(ext(i.path))
  const text = isImg || BIN.includes(ext(i.path)) ? null : await fetch(`/${i.path}`, { cache: 'no-store' }).then((r) => r.text())
  let main = ''
  if (type === 'design-trend') {
    main = `<div class="grid gap-6 xl:grid-cols-[2fr_1fr]"><iframe src="/${esc(i.demo)}" class="h-[75vh] w-full rounded-box border border-base-300 bg-base-100"></iframe><article class="max-h-[75vh] overflow-auto text-sm">${md(text)}</article></div>`
  } else if (type === 'theme') {
    const vars = [...text.matchAll(/--(color-[a-z0-9-]+):\s*([^;]+);/g)]
    const partner = (k) => (k.endsWith('-content') ? k.replace('-content', '') : `${k}-content`)
    main = `<div data-theme="${esc(name)}" class="space-y-4 rounded-box bg-base-100 p-6 text-base-content"><div class="grid grid-cols-2 gap-2 fold:grid-cols-3 lg:grid-cols-5">${vars.map(([, k, v]) => `<div class="rounded-field border border-base-300 p-3 text-xs" style="background:var(--${k});color:var(--${partner(k)},inherit)"><div class="font-semibold">${esc(k)}</div><div class="opacity-80">${esc(v)}</div></div>`).join('')}</div><div class="flex flex-wrap gap-2"><button class="btn btn-primary">Primary</button><button class="btn btn-secondary">Secondary</button><button class="btn btn-accent">Accent</button><span class="badge badge-info">info</span><span class="badge badge-success">success</span><span class="badge badge-warning">warning</span><span class="badge badge-error">error</span></div><input class="input" placeholder="Input"><div role="alert" class="alert alert-info"><span>Alert sample</span></div></div>`
  } else if (pp) {
    main = `<iframe src="${preview(pp)}" class="h-[75vh] w-full rounded-box border border-base-300 bg-base-100"></iframe>`
  } else if (isImg) {
    main = `<div class="grid place-items-center rounded-box bg-base-100 p-8"><img src="/${esc(i.path)}" alt="${esc(name)}" class="max-h-[70vh] max-w-full"></div>`
  }
  if (FONT.includes(ext(i.path))) main = `<div class="space-y-4 rounded-box bg-base-100 p-6" style="font-family:'${fontFamily(i)}'"><p class="text-6xl">Aa Bb Cc 123</p><p class="text-3xl">The quick brown fox jumps over the lazy dog</p><p class="text-base">ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 !?&amp;@</p><p class="text-sm">Small text sample for reading comfort at body sizes.</p></div><a class="btn mt-3" href="/${esc(i.path)}" download>Download</a>`
  else if (text === null && !isImg) main = `<a class="btn" href="/${esc(i.path)}" download>Download ${esc(i.path)}</a>`
  const code = text !== null && type !== 'design-trend'
    ? `<div class="collapse collapse-arrow mt-4 bg-base-100"><input type="checkbox"><div class="collapse-title font-medium">Source <span class="font-mono text-xs opacity-60">${esc(i.path)}</span></div><div class="collapse-content"><pre class="max-h-[60vh] overflow-auto text-xs">${esc(text)}</pre></div></div>`
    : ''
  const meta = `<p class="mt-3 text-xs opacity-60">${esc(i.path)}${i.source ? ` · ${esc(i.source)}` : ''}${i.license ? ` · ${esc(i.license)}` : ''}</p>`
  app.innerHTML = crumbs + main + code + meta
}

async function route() {
  const [type, ...rest] = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (!type) return overview()
  if (!rest.length) return list(type)
  return detail(type, decodeURIComponent(rest.join('/')))
}

$('#search').addEventListener('input', (e) => { state.q = e.target.value.trim().toLowerCase(); if (state.q) list(null); else route() })
$('#theme').addEventListener('change', (e) => { state.theme = e.target.value; storeSet('theme', state.theme); document.documentElement.dataset.theme = state.theme; route() })
addEventListener('hashchange', route)

async function start() {
  await load()
  document.documentElement.dataset.theme = state.theme
  fontFace()
  route()
}
start()

const es = new EventSource('/events')
es.onmessage = () => { location.reload() }
es.onerror = () => { $('#live').className = 'status status-error' }
es.onopen = () => { $('#live').className = 'status status-success' }
