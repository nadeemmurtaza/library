// Zero-dependency dev server for the library viewer.
// Watches the library, rebuilds registry/catalog.json + preview CSS, pushes a reload to open pages.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')
const PORT = Number(process.env.PORT) || 4173
const TAILWIND = path.join(ROOT, 'node_modules/@tailwindcss/cli/dist/index.mjs')
const CSS_OUT = path.join(ROOT, '.cache/preview.css')
const BLOCKED = ['node_modules', '.git', '.claude']
const IGNORED_CHANGES = ['node_modules', '.git', '.claude', '.cache', 'registry/catalog.json', 'tokens/themes/index.ts']

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.otf': 'font/otf',
}

const run = (cmd, args) => new Promise((resolve) =>
  execFile(cmd, args, { cwd: ROOT }, (err, _out, stderr) => {
    if (err) console.error(`[viewer] ${path.basename(args[0])} failed:\n${stderr}`)
    resolve(!err)
  }))

const clients = new Set()
let building = false
let again = false

async function rebuild(reason) {
  if (building) { again = true; return }
  building = true
  const t = Date.now()
  await run(process.execPath, ['scripts/build-catalog.mjs'])
  await run(process.execPath, [TAILWIND, '-i', 'viewer/preview.css', '-o', CSS_OUT])
  building = false
  console.log(`[viewer] rebuilt (${reason}) in ${Date.now() - t}ms`)
  for (const res of clients) res.write('data: reload\n\n')
  if (again) { again = false; rebuild('queued change') }
}

let timer
fs.watch(ROOT, { recursive: true }, (_evt, file) => {
  if (!file) return
  const rel = file.split(path.sep).join('/')
  if (IGNORED_CHANGES.some((p) => rel === p || rel.startsWith(`${p}/`))) return
  clearTimeout(timer)
  timer = setTimeout(() => rebuild(rel), 300)
})

const safe = (rel) => {
  const abs = path.resolve(ROOT, `.${path.sep}${decodeURIComponent(rel)}`)
  const inside = abs === ROOT || abs.startsWith(ROOT + path.sep)
  const blocked = BLOCKED.some((b) => abs.startsWith(path.join(ROOT, b)))
  return inside && !blocked ? abs : null
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

// Split "<!-- Title -->\n<markup>" example files into titled sections.
function sections(html) {
  const parts = html.split(/^<!--\s*(.*?)\s*-->\s*$/m)
  const out = []
  for (let i = 1; i < parts.length; i += 2) {
    if (/^(source|sources):/i.test(parts[i])) continue
    out.push({ title: parts[i], body: parts[i + 1].trim() })
  }
  return out.length ? out : [{ title: '', body: html }]
}

function previewPage(file, theme) {
  const raw = fs.readFileSync(file, 'utf8')
  const body = path.basename(file).includes('.example.')
    ? sections(raw).map((s) => `<section class="mb-8">${s.title ? `<h3 class="mb-3 text-xs font-semibold uppercase tracking-wide opacity-60">${esc(s.title)}</h3>` : ''}<div class="flex flex-wrap items-start gap-3 rounded-box border border-base-300 bg-base-100 p-4">${s.body}</div></section>`).join('')
    : raw
  return `<!doctype html><html data-theme="${esc(theme)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/.cache/preview.css"></head><body class="min-h-screen bg-base-200 p-4 text-base-content">${body}</body></html>`
}

http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  if (url.pathname === '/events') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' })
    res.write('retry: 1000\n\n')
    clients.add(res)
    req.on('close', () => clients.delete(res))
    return
  }
  if (url.pathname === '/preview') {
    const file = safe(url.searchParams.get('path') || '')
    if (!file || !fs.existsSync(file)) { res.writeHead(404).end('not found'); return }
    res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' })
    res.end(previewPage(file, url.searchParams.get('theme') || 'brand'))
    return
  }
  const target = url.pathname === '/' ? 'viewer/index.html' : url.pathname
  const file = safe(target)
  if (!file || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404).end('not found'); return }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' })
  fs.createReadStream(file).pipe(res)
}).listen(PORT, () => {
  console.log(`[viewer] http://localhost:${PORT}`)
  rebuild('startup')
})
