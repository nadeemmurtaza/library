# Reusable Asset Marketplace — Design

- **Status:** Approved design; ready for implementation planning
- **Date:** 2026-10-31
- **Scope:** v1 platform (publish → review → metered call → prepaid billing)
- **Working names:** repository directory `platform/`, packages `@platform/*`, SDKs `@platform/sdk` (TypeScript) and `platform-sdk` (Python). Final brand names are a launch decision and do not affect this design.

---

## 1. Problem and product

Developers publish reusable software assets — components, packages, modules, designs, layouts, design systems, colour palettes, plugins, skills, tools — for any platform, industry, or experience level. Vibe coders and their agents consume those assets through one HTTP call, authenticated with an API key. Every metered call is priced deterministically, paid from a prepaid credit balance, and splits revenue with the publisher.

The platform does **not** execute third-party code in v1. A "call" runs the platform's own deterministic composition engine over published, reviewed artifacts. This makes per-call billing enforceable and keeps the security surface small.

**The first paid call end-to-end is the milestone that proves the product.** Everything else improves supply, trust, or reach.

---

## 2. Goals and non-goals

### Goals (v1)

1. Open publishing with automated gates plus mandatory human review before listing.
2. Immutable, content-addressed, versioned assets with provenance.
3. A single metered call path shared by REST, SDKs, and MCP.
4. A prepaid credit ledger that can never overdraw, double-charge, or lose a charge.
5. Deterministic per-call pricing, frozen into every usage event.
6. Publisher verification, trust score, ratings, and revenue share.
7. A marketplace, consumer dashboard, publisher console, and admin review console.

### Non-goals (v1)

- Third-party code execution (sandboxes, containers, WASM)
- Publisher-hosted endpoint proxying
- Surge or auction pricing
- Subscription plans, invoicing, purchase orders
- Team/org accounts, SSO, private registries
- LLM-based generation or non-deterministic composition
- Multi-region deployment, multi-currency
- Affiliate program, consumer webhooks

---

## 3. Personas and core loop

| Persona | Need |
|---|---|
| **Publisher** | Publish a vetted asset, set a price, see calls and earnings, get paid |
| **Consumer / vibe coder** | One key, one call, predictable cost, usable output |
| **Agent (MCP client)** | Discover, quote and resolve tools without human intervention |
| **Admin (platform owner)** | Review fast, enforce quality, keep the ledger honest |

Core loop:

1. Publisher submits a version (manifest + artifacts) → quarantine → automated gates.
2. Admin reviews gate results, previews and sample output → approves.
3. Consumer creates a key, tops up credits via Stripe, calls `resolve`.
4. Platform quotes, reserves, composes, commits, returns files and a signed bundle URL.
5. Usage event is immutable; publisher accrual is recorded; payouts run monthly (M4).

---

## 4. Locked decisions

| Decision | Choice |
|---|---|
| Publisher model | Open marketplace; every package manually reviewed after automated gates |
| Execution | Platform-run deterministic `resolve`; no third-party code |
| Billing | Prepaid credits; 1 credit = 1 US cent; Stripe Checkout |
| Pricing | Per-asset base price + deterministic call modifiers; free assets allowed |
| Take rate | 20% default (`2000` bps), per-publisher override by admin |
| Architecture | Modular monolith, one Postgres, one transactional ledger |
| Surfaces | REST v1, TypeScript + Python SDKs, MCP server |
| Currency | USD only |
| Review | Single human reviewer (platform owner) at launch |

---

## 5. Architecture

### 5.1 Deploy units

| Unit | Runtime | Responsibility |
|---|---|---|
| `apps/api` | Hono on Node 22 | All HTTP: REST, MCP, auth, resolve, ledger, Stripe webhooks |
| `apps/web` | Next.js | Marketplace, consumer dashboard, publisher console, admin console |
| `apps/worker` | Node 22 | Review gates, reservation expiry, usage rollups, Stripe retries, payout statements |
| `packages/shared` | TypeScript | zod schemas, pricing rules, money math, types, OpenAPI generation |

State:

- **Postgres + Drizzle** — source of truth for accounts, catalog, ledger, usage.
- **S3-compatible object storage** — content-addressed artifacts, quarantine bucket, generated bundles.
- **Stripe** — Checkout and webhooks in v1; Connect in M4.
- **Redis** — intentionally absent in v1. Rate limits and caches sit behind interfaces so they can be added without touching callers.

### 5.2 Modules in `apps/api`

| Module | Owns | Must not |
|---|---|---|
| `accounts` | accounts, sessions, API keys, scopes, verification state | touch the ledger |
| `catalog` | assets, versions, manifests, search, ratings, ranking | price or charge |
| `resolve` | composition engine, artifact reads, bundle generation | write money |
| `meter` | quote, reserve, commit, refund — **sole ledger writer** | compose files |
| `billing` | Stripe Checkout, webhooks, accrual and payout records | serve catalogs |
| `review` | submissions, gate orchestration, decisions, takedowns | publish without approval |
| `mcp` | MCP transport and tool schemas | bypass `meter` |

Module boundaries are interfaces, not folders: `meter` exposes `quote()`, `reserve()`, `commit()`, `refund()`. Extracting `meter` into its own service later should not change any caller.

### 5.3 Call path

1. **Authenticate** — `Authorization: Bearer pk_live_…`; hash lookup, status, scopes, rate limit.
2. **Quote** — deterministic price from selected asset versions and call modifiers.
3. **Reserve** (paid calls) — single atomic update: `available -= price` guarded by `available >= price`; create `usage_event(status = pending)`; reservation expires in 60 seconds. `price = 0` skips to compose and writes a billed event directly.
4. **Compose** — load manifests and artifacts, apply tokens/theme/framework mapping, render files; compute a composition hash.
5. **Commit** — mark event `billed`, move reserved credits to spent, enqueue publisher accrual; any failure → `refund` and event `refunded`.
6. **Respond** — `callId`, quote breakdown, file list with hashes, signed bundle URL (15-minute TTL) or inline JSON.

**Idempotency.** Every `resolve` requires an `Idempotency-Key` (REST header) or `idempotencyKey` (MCP arg). `(account_id, key)` is unique for 24 hours. A replay returns the stored response and does not charge; the same key with a different request body returns `409 idempotency_conflict`. This is mandatory because MCP clients retry tool calls.

**Determinism.** Same versions + same constraints + same format produce byte-identical output. The composition hash doubles as a cache key; caching reduces compute but never changes billing.

---

## 6. Data model

All timestamps are UTC. All identifiers are UUIDv7. Money columns are integers, never floats.

| Table | Key columns | Notes |
|---|---|---|
| `accounts` | id, type (`consumer` / `publisher` / `both`), email, status | one account can both buy and publish |
| `publisher_profiles` | account_id, display_name, verification_tier (`T0`/`T1`/`T2`), trust_score, stripe_account_id | T1 required for paid assets |
| `sessions` | id, account_id, expires_at | console auth via email magic link |
| `api_keys` | id, account_id, prefix, key_hash, scopes[], last_used_at, revoked_at | plaintext shown once |
| `assets` | id, publisher_id, slug, title, kind, platforms[], industries[], levels[], tags[], status | unique `(publisher_id, slug)` |
| `asset_versions` | id, asset_id, semver, content_hash, manifest jsonb, status, published_at, revoked_at | unique `(asset_id, semver)` and `(asset_id, content_hash)` |
| `asset_prices` | version_id, base_credits, free, take_rate_bps | one per version; changes create a new version |
| `usage_events` | id, account_id, api_key_id, kind, asset_version_ids[], price_snapshot jsonb, credits, status, composition_hash, created_at | append-only |
| `idempotency_keys` | account_id, key, request_hash, usage_event_id, response jsonb, created_at | 24-hour retention |
| `credit_ledger` | id, account_id, delta_credits, reason, usage_event_id, stripe_ref, created_at | append-only |
| `credit_balances` | account_id, available, reserved, lifetime_spent | cached; written in the same transaction as the ledger |
| `publisher_accruals` | id, publisher_id, usage_event_id, gross_credits, platform_fee_micro_usd, net_micro_usd, status | one per billed event on a paid asset |
| `payouts` | id, publisher_id, period, net_micro_usd, stripe_transfer_id, status | M4 |
| `review_jobs` | id, version_id, gates jsonb, state, reviewer_id, decision, notes | one active job per version |
| `asset_ratings` | asset_id, account_id, stars, body, verified, publisher_reply, updated_at | unique `(asset_id, account_id)` |
| `stripe_events` | id, type, processed_at | webhook idempotency |
| `audit_log` | id, actor_id, action, target_type, target_id, metadata, created_at | approvals, revocations, overrides |

**Version lifecycle:** `draft → submitted → gates_running → gates_failed | in_review → approved | changes_requested | rejected`, with `approved → revoked` for takedowns. Only `approved` versions can be resolved or appear in search.

**Usage event lifecycle:** `pending → billed | refunded | expired`. `expired` releases the reservation and writes a refund entry.

**Asset kinds:** `component`, `package`, `module`, `design`, `layout`, `design-system`, `palette`, `plugin`, `skill`, `tool`, `template`, `theme`.

---

## 7. Ledger and money flow

**Units.** 1 credit = $0.01. Consumer balances, prices and usage are integer credits. Publisher accruals are integer micro-USD (1 credit = 10,000 micro-USD).

**Top-up.** Stripe Checkout in bundles (minimum $5 = 500 credits). A successful `checkout.session.completed` writes exactly one `topup` ledger entry, guarded by `stripe_events` idempotency. Credits granted equal the Stripe amount in cents (`$5.00 → 500 credits`) and are available immediately; card disputes are handled by debit adjustments with an audit entry.

**Reserve / commit / refund.**

- `reserve` (paid calls only): ledger `reserve` with `delta = -price`; `available -= price`, `reserved += price`.
- `commit`: ledger `commit` with `delta = 0` — a memo that closes the reservation; `reserved -= price`, `lifetime_spent += price`; accrual rows for paid assets.
- `refund` / `expire`: ledger `refund` with `delta = +price`; `reserved -= price`, `available += price`.

A reservation is a debit from `available` held in `reserved`; committing converts the hold into spend without changing ownership a second time.

**Invariants (tested, not assumed):**

1. `available == sum(credit_ledger.delta_credits)` for every account at all times, and `reserved >= 0`.
2. A paid billed event has exactly one `commit` memo; a refunded or expired event has exactly one refund entry and no commit.
3. Price snapshots are immutable; later price changes never alter historical events.
4. No call is served unless a reservation exists; no reservation outlives 60 seconds without commit or refund.
5. Free calls (`price = 0`) skip reserve and commit, writing a single `billed` event with `credits = 0`; they are logged for demand and abuse analysis and never create accruals.

**Revenue split.** On commit, for each paid asset version in the event (1 credit = 10,000 micro-USD, so the fee fraction `bps / 10_000` cancels):

- `platform_fee_micro_usd = gross_credits × take_rate_bps`
- `net_micro_usd = gross_credits × (10_000 − take_rate_bps)`

Example: 10 credits at 2,000 bps → 20,000 micro-USD fee ($0.02) and 80,000 micro-USD net ($0.08). Each version carries its own take rate, so a multi-publisher call applies each version's rate. Credits are attributed to paid assets proportional to base price using largest-remainder rounding; the remainder credit goes to the highest-base asset, so shares always sum to the event total exactly.

**Trial.** Every new account receives 200 credits ($2) once, recorded as a `trial` ledger entry. Trial grants are limited to one per verified email; accounts sharing a payment fingerprint or device signal are blocked from additional grants.

**Reconciliation.** A daily job compares Stripe charges/refunds against ledger top-ups/adjustments and alerts on any mismatch. Reservation expiry runs every minute.

---

## 8. Pricing

Each approved version carries exactly one price rule:

```json
{ "base_credits": 3, "free": false, "take_rate_bps": 2000 }
```

Call price:

```text
if all selected versions are free:                       0
else:  ceil(sum(base_credits) × (commercial ? 1.5 : 1)) + (format == "zip" ? 1 : 0)
       minimum 1
```

- `base_credits` is set by the publisher: 1–500 for paid versions; free versions set `free: true` with `base_credits: 0`. Any change requires a new version plus review.
- Modifiers in v1: commercial-use (+50%, rounded up) and zip packaging (+1 credit).
- Admin can override `take_rate_bps` per publisher; the override is audited.
- "Dynamic" means composition-based and deterministic. It is never surge pricing and never varies with demand or time.
- `POST /v1/quote` returns the exact price, breakdown, and whether credits are sufficient, without charging.

---

## 9. REST API v1

Base path `/v1`. JSON only. Errors use RFC 7807 `application/problem+json`.

| Method | Path | Auth | Metered |
|---|---|---|---|
| GET | `/v1/assets` | public | no |
| GET | `/v1/assets/{publisher}/{slug}` | public | no |
| GET | `/v1/assets/{publisher}/{slug}/versions/{semver}` | public | no |
| POST | `/v1/quote` | key | no |
| POST | `/v1/resolve` | key (`resolve`) | yes |
| GET | `/v1/balance` | key (`billing:read`) | no |
| GET | `/v1/usage?from&to&groupBy=asset\|day` | key (`billing:read`) | no |
| GET/POST/DELETE | `/v1/keys` | session | no |
| POST | `/v1/checkout` | session | no |
| GET | `/v1/statements` | session | no |
| POST | `/v1/publisher/submissions` | session | no |
| GET | `/v1/publisher/assets/{id}/versions` | session | no |
| GET | `/v1/publisher/earnings` | session | no |
| GET | `/v1/admin/review-queue` | admin session | no |
| POST | `/v1/admin/review/{jobId}/decision` | admin session | no |

Catalog reads are public so the marketplace works without signup; they are rate-limited by IP (30/min), and authenticated keys get higher limits. Every other route requires a key or a session.

`POST /v1/resolve` request:

```json
{
  "intent": "dark pricing page for a developer tool",
  "assets": [{ "ref": "acme/aurora-design-system", "version": "2.1.0" }],
  "constraints": { "style": "minimal", "theme": "dark", "framework": "react", "language": "en" },
  "output": { "format": "zip", "commercial": false },
  "idempotencyKey": "0191f0c2-7a4e-7c3b-9f2e-1a2b3c4d5e6f"
}
```

Response:

```json
{
  "callId": "0191f0c2-7a4e-7c3b-9f2e-1a2b3c4d5e6f",
  "selection": [{ "ref": "acme/aurora-design-system@2.1.0", "baseCredits": 8 }],
  "quote": { "credits": 9, "usd": "0.09", "breakdown": [{ "label": "base", "credits": 8 }, { "label": "zip", "credits": 1 }] },
  "files": [{ "path": "index.html", "sha256": "…", "bytes": 4211 }],
  "bundleUrl": "https://…/bundles/….zip?expires=…",
  "expiresAt": "2026-10-31T12:15:00Z"
}
```

Limits: 8 assets per call; output ≤ 25 MB; inline JSON only when ≤ 1 MB, otherwise `bundleUrl`.

Error codes: `insufficient_credits` (402, includes required credits and a top-up URL), `asset_not_found`, `version_not_approved`, `asset_revoked`, `idempotency_conflict`, `scope_denied`, `rate_limited` (429 + `Retry-After`), `invalid_selection`, `quota_exceeded`.

**API keys.** Format `pk_live_<32 base62>` and `pk_test_<32 base62>`; stored as HMAC-SHA256 with a server pepper and an indexed 8-character lookup prefix; shown once. Scopes: `catalog:read`, `resolve`, `billing:read`. Test keys hit the same catalog but never touch money; their calls are logged with `credits = 0`, test resolves are capped at 50 per day per key, and test bundles carry a `TEST` watermark.

**Rate limits (v1, Postgres token bucket):** search 60/min, quote 60/min, resolve 12/min, burst 30, per key. Account-level ceiling 300 calls/min.

---

## 10. MCP

Transport: Streamable HTTP at `POST /mcp`, authenticated with the same Bearer key.

| Tool | Metered | Purpose |
|---|---|---|
| `search_assets` | no | ranked search with compact results |
| `get_asset` | no | manifest, price, ratings, docs |
| `quote` | no | exact price before committing |
| `resolve` | **yes** | compose and return files or a bundle URL |

`resolve` requires `idempotencyKey`. Tool descriptions state the price, the free tier, and the output limits so an agent can decide without guessing. Tool schemas are generated from the same zod definitions as REST, and tool calls map one-to-one to `usage_events`. Free tool calls and free resolves are logged at price 0.

A stdio shim (`npx @platform/mcp`) proxies to the hosted endpoint for clients that cannot connect remotely.

---

## 11. SDKs

- `@platform/sdk` (TypeScript) and `platform-sdk` (Python), generated from `packages/shared/openapi.json`.
- Hand-written ergonomic layer: auth from env, automatic idempotency keys, typed errors, 402 recovery hint, signed-URL download helper, pagination iterator.
- Generated code is never edited by hand; regeneration is a CI check against the OpenAPI snapshot.
- SDKs expose REST only. MCP is a separate package.

---

## 12. Publishing and review

### 12.1 Package format

`asset.json` manifest:

```json
{
  "slug": "aurora-design-system",
  "title": "Aurora Design System",
  "kind": "design-system",
  "summary": "Dark-first system for developer tools",
  "platforms": ["web", "react"],
  "industries": ["saas", "developer-tools"],
  "levels": ["beginner", "intermediate"],
  "license": "MIT",
  "version": "2.1.0",
  "entrypoints": { "main": "index.css", "react": "react/index.tsx" },
  "compatibility": { "react": ">=18", "node": ">=20" },
  "previews": ["previews/hero.png"],
  "pricing": { "base_credits": 8, "free": false },
  "changelog": "Added data tables"
}
```

Rules:

- Content-addressed tarball; `content_hash = sha256(canonical archive)`.
- Identical hash resubmission is a no-op. Editing an approved version is impossible; changes require a new semver.
- Uploads go to a quarantine bucket via pre-signed URLs and are promoted only after scanning.
- Artifacts are never fetched from publisher URLs during resolve (no SSRF surface).

### 12.2 Automated gates

All must pass before human review:

| Gate | Checks |
|---|---|
| `manifest` | zod schema, enumerated kinds/platforms, semver, SPDX id |
| `structure` | entrypoints exist, no symlinks, no `..` paths, size limits, total ≤ 100 MB |
| `license` | license file present, SPDX on allowlist |
| `secrets` | secret scan over all text files |
| `malware` | signature scan, archive-bomb and nested-archive limits |
| `deps` | OSV scan for code assets |
| `smoke` | run three canonical resolve intents in a network-disabled sandbox; snapshot output |
| `policy` | duplicate/impersonation detection (hash + fuzzy name), trademark flags, previews present |
| `quality` | docs completeness ≥ 80%; axe pass on UI previews; performance within budget |

Gate results are stored as structured JSON and shown verbatim to the reviewer.

### 12.3 Human review

The admin queue shows: gate results, diff against the previous version, rendered preview, the smoke-test output, manifest, license, and a checklist. Decisions: approve, request changes, reject. Every decision writes an audit entry with notes. At launch the platform owner is the only reviewer; the design keeps the reviewer identity per decision so a second reviewer can be added without schema change.

### 12.4 Verification

| Tier | Requirement | Unlocks |
|---|---|---|
| T0 | verified email | publish free assets |
| T1 | manual identity check at launch (Stripe Identity in phase 2) | publish paid assets |
| T2 | domain verification + Stripe Connect KYB | company badge, payouts |

### 12.5 Trust score (0–100)

```text
tier_points      = T0: 0, T1: 15, T2: 25
approval_points  = round(approval_rate × 25), neutral 10 with no history
rating_points    = round((avg_stars / 5) × 20), neutral 10 with no ratings
dispute_penalty  = min(15, round(dispute_rate × 100))
tenure_points    = round(min(months_on_platform, 12) / 12 × 15)
trust            = clamp(0, 100, tier_points + approval_points + rating_points + tenure_points − dispute_penalty)
```

`approval_rate = approved / (approved + rejected)`; `changes_requested` is excluded until the version is decided. `dispute_rate = (refunds + chargebacks) / paid calls` over the trailing 90 days. The formula is versioned; scores are recomputed nightly and shown with their version. Trust feeds ranking and is displayed on listings and profiles.

### 12.6 Ratings

1–5 stars, one per account per asset, editable. "Verified" requires a resolve event (billed or free) of that asset by that account. Publisher replies are allowed; text reviews pass a moderation queue. Report/abuse flows through the admin console.

### 12.7 Ranking

Postgres full-text relevance over name, summary, tags and kind, then:

```text
score = relevance × (0.5 + trust/100) × (0.7 + avg_stars/5 × 0.6) × recency_boost
```

Free assets are a filter, never a penalty. Ranking has a single implementation with golden tests.

---

## 13. Surfaces

**Public marketplace.** Search-first home with a 60-second quickstart (create key → top up → copy call). Filters: kind, platform, industry, level, free, rating, trust. Asset page: live preview, per-call price, trust badge, ratings, changelog, manifest, and copy-ready curl / TypeScript / Python / MCP config. Publisher profiles show verification, trust and catalog.

**Consumer dashboard.** Keys and scopes with last-used, balance and top-up, usage by asset and day, statements, and a playground that quotes and resolves with a test key.

**Publisher console.** Submissions with gate status, version history, earnings and payout statements, ratings and replies, call/revenue analytics, verification status.

**Admin console.** Review queue, publisher verification, takedowns and revocations, pricing/take-rate overrides, ledger and usage explorer, reconciliation alerts.

---

## 14. Security and abuse

- Keys hashed with a server-side pepper; never logged; revocation is immediate.
- Scope enforcement at the route boundary; admin routes require an admin session, never an API key.
- Signed bundle URLs expire in 15 minutes and are scoped to one event.
- Artifact handling: quarantine, zip-bomb limits, no symlinks, no path traversal, no execution.
- SSRF: resolve never fetches publisher URLs or arbitrary network resources.
- Abuse: trial limited by email and payment fingerprint; per-key and per-account rate limits; anomaly alerts on call spikes and refund ratios; credit debits with audit entries for chargebacks.
- Content: license allowlist, trademark flags in review, takedown workflow that revokes versions without deleting usage history.

---

## 15. Observability and operations

- Structured logs with `request_id`, `call_id`, `account_id`, `key_id`, `credits`, `status`.
- Metrics: calls per surface and kind, p50/p95 latency, insufficient-credit rate, gate pass rate, review SLA, resolve failure rate.
- Jobs: reservation expiry (1 min), idempotency-key cleanup (hourly), accrual rollup, trust recompute (nightly), Stripe reconciliation (daily), Stripe webhook retries.
- Alerts: ledger mismatch, reconciliation mismatch, reservation backlog, gate failure spike, resolve error spike.

---

## 16. Testing

**Unit / property**

- Pricing determinism: same inputs → same credits; commercial and zip modifiers; free calls at 0.
- Ledger invariants with property-based tests: any interleaving of reserve/commit/refund/expire keeps `available == sum(delta)` and `reserved >= 0`.
- Accrual split sums to the event total in every multi-asset case.
- Manifest validation, trust score formula, ranking formula (golden cases).

**Integration**

- Full call path against a real Postgres: quote → reserve → compose → commit → usage row.
- Concurrency: 50 parallel resolves with credits for 1 → exactly one success, zero overdraws.
- Idempotency: replay returns identical response and one charge; body mismatch → 409.
- Stripe webhook replay → one top-up; reservation expiry → refund.
- MCP retry → no double charge.

**Contract / security**

- OpenAPI snapshot ↔ SDK generation; MCP tool schema snapshot.
- Scope denial, revoked key, path traversal, zip bomb, oversized output.

**E2E (Playwright)**

Publish → gates → approve → top up (test mode) → resolve → usage and balance update → rating requires a resolve.

---

## 17. Milestones

| Phase | Deliverable | Acceptance |
|---|---|---|
| **M0 Foundations** | monorepo, schema + migrations, magic-link auth, API keys, Stripe test mode, importer from `registry/catalog.json` | authenticated `GET /v1/balance` with a real key |
| **M1 Publish & review** | manifest schema, quarantine upload, gates, review console, immutable versions, T0/T1 verification | a real asset goes submit → gates → approve, hash stable |
| **M2 Call & charge** | quote/reserve/commit/refund, resolve v1, credits, top-ups, usage dashboard | **first paid call**; concurrency and replay tests pass |
| **M3 Reach** | REST polish, MCP server, TS + Python SDKs, marketplace UI, ratings | agent resolves through MCP; SDK round-trip |
| **M4 Money-out** | accruals, statements, Stripe Connect, trust scoring, ranked search | publisher receives a test payout statement |

Resolve engine v1: intent → ranked asset selection (max 8) → load approved artifacts → apply tokens, theme and framework mapping → emit files + manifest + LICENSE + README → zip or inline JSON. Deterministic, no network, no LLM.

---

## 18. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Resolve quality is the product, not the ledger | Budget design time on composition; smoke-test outputs are reviewed; seed with the existing library's design systems and templates |
| Manual review does not scale to "any package" | Gates must catch ~90%; review SLA metrics; reject with actionable reasons; batch review tools |
| Delivered files are copyable | Licensing and terms, preview watermarks, trust signals and support — not DRM |
| Credit abuse via trials and chargebacks | Identity/payment fingerprints, caps, audit debits, anomaly alerts |
| Price complexity confuses buyers | Quote endpoint and per-call price on every listing; breakdown in every response |
| MCP retries double-charge | Mandatory idempotency keys, 24-hour dedupe, replay tests |
| Single reviewer becomes the bottleneck | Reviewer identity per decision; gates and checklists designed for delegation |

---

## 19. Phase 2+ (explicitly deferred)

Publisher-hosted endpoint proxying, sandboxed third-party execution, subscription plans and invoicing, team accounts and SSO, private registries, consumer webhooks, LLM-assisted composition, multi-currency, affiliate program.
