import test from 'node:test'
import assert from 'node:assert/strict'
import { html, raw, esc } from '../utils/html.js'
import { cn } from '../utils/cn.js'
import { createMoney } from '../utils/money.js'
import { createDates } from '../utils/dates.js'
import { createStorage } from '../utils/storage.js'
import { toCsv } from '../utils/csv.js'
import { slugify, uid } from '../utils/slug.js'
import { validate } from '../utils/validate.js'
import { createDb } from '../lib/collection-store.js'
import { createActivityLog } from '../lib/activity-log.js'
import { createTable } from '../hooks/use-table.js'
import { createSelection } from '../hooks/use-selection.js'
import { createAuth } from '../providers/auth-provider.js'
import { can, ROLES } from '../constants/roles.js'
import { ORDER_STATUS, ORDER_FLOW } from '../constants/statuses.js'
import { barChart, donut } from '../components/common/charts.js'
import { statCard } from '../components/common/stat-card.js'
import { badgeFor } from '../components/ui/badge.js'
import { textField } from '../components/ui/field.js'
import fs from 'node:fs'

const memBackend = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k), get length() { return m.size }, key: (i) => [...m.keys()][i] } }

test('html escapes interpolations, raw passes through', () => {
  assert.equal(String(html`<p>${'<b>&"'}</p>`), '<p>&lt;b&gt;&amp;&quot;</p>')
  assert.equal(String(html`<p>${raw('<b>x</b>')}</p>`), '<p><b>x</b></p>')
  assert.equal(String(html`<ul>${['a', '<i>'].map((x) => html`<li>${x}</li>`)}</ul>`), '<ul><li>a</li><li>&lt;i&gt;</li></ul>')
  assert.equal(esc(null), '')
})
test('cn joins truthy classes', () => assert.equal(cn('a', false, { b: true, c: 0 }, ['d', null]), 'a b d'))
test('money and dates take locale from config', () => {
  assert.equal(createMoney({ currency: 'PKR', intlTag: 'en-PK' }).format(12555), 'PKR 12,555')
  assert.equal(createMoney({ currency: 'USD' }).parse('$1,200.50'), 1200.5)
  const d = createDates({ intlTag: 'en-US', timezone: 'UTC' })
  assert.equal(d.iso('2026-03-04T10:00:00Z'), '2026-03-04'); assert.ok(d.ago(Date.now() - 3 * 86400e3).includes('3'))
})
test('storage survives blocked writes', () => {
  const s = createStorage('t', { ...memBackend(), setItem() { throw new Error('blocked') } })
  s.set('k', { a: 1 }); assert.deepEqual(s.get('k'), { a: 1 }); s.remove('k'); assert.equal(s.get('k', 'z'), 'z')
})
test('csv quotes cells', () => assert.equal(toCsv([{ a: 'x,"y"', b: 2 }], [{ key: 'a', label: 'A' }, { key: 'b' }]), 'A,b\n"x,""y""",2'))
test('slug and uid', () => { assert.equal(slugify('Thai & Lily of the Valley!'), 'thai-and-lily-of-the-valley'); assert.match(uid('ord'), /^ord_/) })
test('validate covers required, ranges, patterns', () => {
  const schema = JSON.parse(fs.readFileSync(new URL('../schemas/promo.schema.json', import.meta.url)))
  assert.deepEqual(Object.keys(validate(schema, { code: 'a b', pct: 120 }).errors).sort(), ['code', 'pct'])
  assert.equal(validate(schema, { code: 'WELCOME5', pct: 5 }).valid, true)
  assert.equal(validate(schema, {}).errors.code, 'This field is required.')
})
test('collection store CRUD, seed once, subscribe, dump/restore', () => {
  const db = createDb({ storage: createStorage('s', memBackend()) }), c = db.collection('orders'); let n = 0
  c.subscribe(() => n++); c.seed([{ id: 'a' }]); c.seed([{ id: 'b' }]); assert.equal(c.count(), 1)
  const r = c.insert({ x: 1 }); c.update(r.id, { x: 2 }); assert.equal(c.get(r.id).x, 2); c.remove(r.id)
  assert.equal(c.count(), 1); assert.ok(n >= 4)
  const snap = db.dump(['orders']); db.clear(['orders']); assert.equal(c.count(), 0); db.restore(snap); assert.equal(c.count(), 1)
  const log = createActivityLog(db.collection('activity'), { max: 3 }); for (let i = 0; i < 5; i++) log.log('u', 'a', String(i)); assert.equal(log.recent().length, 3)
})
test('table: search, filter, sort, paginate', () => {
  const rows = [...'abcde'].map((n, i) => ({ n, p: 5 - i, s: i % 2 ? 'x' : 'y' }))
  const t = createTable({ rows, searchKeys: ['n'], pageSize: 2 })
  t.sortBy('p'); assert.equal(t.view().rows.map((r) => r.n).join(''), 'ed'); assert.equal(t.view().pages, 3)
  t.sortBy('p'); assert.equal(t.view().rows[0].n, 'a')
  t.setPage(3); assert.equal(t.view().rows.length, 1); t.setFilter('s', 'x'); assert.equal(t.view().total, 2); assert.equal(t.view().page, 1)
  t.clearFilters(); t.setSearch('C'); assert.equal(t.view().total, 1)
})
test('selection', () => { const s = createSelection(); s.toggle('a'); s.toggleAll(['a', 'b']); assert.deepEqual(s.ids().sort(), ['a', 'b']); s.toggleAll(['a', 'b']); assert.equal(s.count(), 0); s.toggle('c'); s.clear(); assert.equal(s.count(), 0) })
test('auth: login, role gate, ttl', () => {
  const a = createAuth({ storage: createStorage('a', memBackend()), users: [{ email: 'S@x.io', name: 'S', role: 'staff', secret: 'pw' }] })
  assert.equal(a.login('s@x.io', 'bad'), null); assert.ok(a.login('s@x.io', 'pw')); assert.ok(a.can('orders:edit')); assert.ok(!a.can('orders:delete')); a.logout(); assert.equal(a.session(), null)
  assert.ok(can('owner', 'settings:edit')); assert.ok(!can('viewer', 'orders:edit')); assert.ok(!can('nobody', 'orders:view')); assert.ok(ROLES.manager.permissions.includes('settings:view'))
})
test('status flows are consistent', () => {
  for (const [k, v] of Object.entries(ORDER_STATUS)) for (const n of v.next) assert.ok(ORDER_STATUS[n], `${k}->${n}`)
  assert.ok(ORDER_FLOW.every((s) => ORDER_STATUS[s]))
})
test('components render escaped, labelled markup', () => {
  assert.match(statCard({ label: 'Revenue', value: '<x>', delta: -3 }), /&lt;x&gt;/)
  assert.match(badgeFor(ORDER_STATUS, 'new'), /badge-info/)
  assert.match(textField('name', 'Name', '"q"', { error: 'Bad' }), /aria-describedby|for="name"/)
  assert.match(barChart({ data: [{ label: 'a', value: 2 }, { label: 'b', value: 0 }] }), /<svg/)
  assert.match(donut({ data: [{ label: 'a', value: 1, tone: 'info' }], centre: '1' }), /admin-arc--info/)
})
