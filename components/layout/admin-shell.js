/**
 * Admin shell: sidebar (collapses to a drawer on small screens), top bar, hash router, route guard.
 *   const shell = mountShell(root, { brand, routes, auth, theme, views: { orders: (ctx) => ..., ... }, onLogout })
 * A view is (ctx) => string | Promise<string> | { html, mount(el) } ; ctx = { el, params, navigate, route }.
 */
import { esc } from '../../utils/html.js'
import { icon } from '../ui/icons.js'

export function mountShell(root, { brand, routes, auth, theme, views, search, onLogout, logoSrc }) {
  const s = auth.session()
  const badges = {}
  const groups = [...new Set(routes.map((r) => r.group))]
  const nav = (id) => groups.map((g) => { const items = routes.filter((r) => r.group === g && auth.can(r.perm)); return items.length ? `<p class="admin-nav__group">${esc(g)}</p>${items.map((r) => `<a href="#/${r.id}" class="admin-nav__link${r.id === id ? ' is-active' : ''}" data-route="${r.id}" ${r.id === id ? 'aria-current="page"' : ''}>${icon(r.icon)}<span>${esc(r.label)}</span><i class="admin-nav__badge" data-badge="${r.id}"${badges[r.id] ? '' : ' hidden'}>${badges[r.id] || ''}</i></a>`).join('')}` : '' }).join('')
  root.innerHTML = `
  <a class="admin-skip" href="#admin-main">Skip to content</a>
  <div class="admin-shell">
    <aside class="admin-side" id="admin-side" aria-label="Main">
      <a class="admin-brand" href="#/dashboard" aria-label="${esc(brand.identity.adminTitle)}">${logoSrc ? `<img src="${esc(logoSrc)}" alt="" class="admin-brand__logo">` : ''}<span>${esc(brand.identity.shortName)} <small>Admin</small></span></a>
      <nav class="admin-nav" data-nav></nav>
      <div class="admin-side__foot"><a class="admin-nav__link" href="/" target="_blank" rel="noopener">${icon('external')}<span>View storefront</span></a></div>
    </aside>
    <div class="admin-scrim" data-scrim hidden></div>
    <div class="admin-main">
      <header class="admin-top">
        <button class="btn btn-ghost btn-square admin-top__menu" data-menu aria-label="Open menu" aria-controls="admin-side">${icon('menu')}</button>
        <label class="admin-gsearch"><span class="sr-only">Search the admin</span>${icon('search', 'size-4')}<input type="search" data-gsearch placeholder="Search orders, bouquets, customers" autocomplete="off"><div class="admin-gsearch__out" data-gout hidden></div></label>
        <span class="admin-top__spacer"></span>
        <button class="btn btn-ghost btn-square" data-theme aria-label="Toggle dark mode">${icon(theme.mode() === 'dark' ? 'sun' : 'moon')}</button>
        <div class="dropdown dropdown-end"><button tabindex="0" class="admin-user" aria-label="Account menu"><span class="admin-user__av">${esc((s?.name || '?').slice(0, 1))}</span><span class="admin-user__name">${esc(s?.name || '')}<small>${esc(s?.role || '')}</small></span></button>
          <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-30 w-52 p-2 shadow-lg border border-base-300"><li class="menu-title">${esc(s?.email || '')}</li><li><a href="#/settings">${icon('cog', 'size-4')}Settings</a></li><li><button data-logout>${icon('logout', 'size-4')}Sign out</button></li></ul></div>
      </header>
      <main id="admin-main" class="admin-content" tabindex="-1"></main>
    </div>
  </div>`
  const main = root.querySelector('#admin-main'), side = root.querySelector('#admin-side'), scrim = root.querySelector('[data-scrim]')
  const toggleSide = (open) => { side.classList.toggle('is-open', open); scrim.hidden = !open; root.querySelector('[data-menu]').setAttribute('aria-expanded', String(open)) }
  root.querySelector('[data-menu]').addEventListener('click', () => toggleSide(!side.classList.contains('is-open')))
  scrim.addEventListener('click', () => toggleSide(false))
  root.querySelector('[data-logout]').addEventListener('click', () => { auth.logout(); onLogout && onLogout() })
  root.querySelector('[data-theme]').addEventListener('click', (e) => { theme.toggle(); e.currentTarget.innerHTML = icon(theme.mode() === 'dark' ? 'sun' : 'moon') })

  const parse = () => { const [path, qs] = location.hash.replace(/^#\/?/, '').split('?'); const [id, ...rest] = (path || 'dashboard').split('/'); return { id: id || 'dashboard', rest, params: Object.fromEntries(new URLSearchParams(qs || '')) } }
  const navigate = (to) => { location.hash = to.startsWith('#') ? to : `#/${to}` }
  let token = 0, cleanup = null
  async function render() {
    const { id, rest, params } = parse(), my = ++token
    const route = routes.find((r) => r.id === id) || routes[0]
    if (!auth.can(route.perm)) { const first = routes.find((r) => auth.can(r.perm)); if (first && first.id !== route.id) return navigate(first.id) }
    root.querySelector('[data-nav]').innerHTML = nav(route.id); toggleSide(false)
    cleanup && cleanup(); cleanup = null
    main.innerHTML = '<div class="admin-loading"><span class="loading loading-spinner"></span></div>'
    const ctx = { el: main, params, rest, navigate, route }
    let out; try { out = await views[route.id](ctx) } catch (err) { console.error(err); out = `<div class="admin-empty"><h3>Something went wrong</h3><p>${esc(err.message)}</p></div>` }
    if (my !== token) return
    if (typeof out === 'string') main.innerHTML = out
    else if (out && out.html !== undefined) { main.innerHTML = out.html; cleanup = (out.mount && out.mount(main)) || null }
    document.title = `${route.label} · ${brand.identity.adminTitle}`
    window.scrollTo({ top: 0 })
  }
  addEventListener('hashchange', render)
  // global search
  const gs = root.querySelector('[data-gsearch]'), go = root.querySelector('[data-gout]')
  if (search) {
    gs.addEventListener('input', () => { const q = gs.value.trim(); if (!q) { go.hidden = true; return } const res = search(q).slice(0, 8); go.innerHTML = res.length ? res.map((r) => `<a href="${esc(r.href)}" data-g><b>${esc(r.title)}</b><small>${esc(r.kind)} · ${esc(r.sub || '')}</small></a>`).join('') : '<p class="p-3 text-sm text-base-content/60">No results</p>'; go.hidden = false })
    go.addEventListener('click', () => { go.hidden = true; gs.value = '' })
    document.addEventListener('click', (e) => { if (!e.target.closest('.admin-gsearch')) go.hidden = true })
  }
  addEventListener('keydown', (e) => { if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !document.querySelector('dialog[open]')) { e.preventDefault(); gs.focus() } })
  render()
  return { render, navigate, setBadge(id, n) { badges[id] = n; const b = root.querySelector(`[data-badge="${id}"]`); if (b) { b.textContent = n; b.hidden = !n } }, refreshNav() { const { id } = parse(); root.querySelector('[data-nav]').innerHTML = nav(id) } }
}
