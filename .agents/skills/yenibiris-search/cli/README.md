# yenibiris-cli

CLI for searching jobs on [yenibiris.com](https://www.yenibiris.com) (Turkey).

**Data source**: SSR HTML search cards + JSON-LD `JobPosting` on detail pages.
**Authentication**: Browser session cookie recommended (Cloudflare).
**Dependencies**: None (plain `bun` + shared `resilient-fetch`). `bun install` is optional and only pulls dev type defs.

> **Personal use only.** Keep volume low, don't use it commercially or for bulk data collection, and run it on your own responsibility.

## Cloudflare

yenibiris.com is Cloudflare-protected. Jobcraft onboarding:

```bash
./scripts/setup-portal-auth.sh    # guided setup
./scripts/test-yenibiris-cookie.sh
```

Full guide: [`docs/portal-authentication.md`](../../../../docs/portal-authentication.md) (repo root).

If blocked without a cookie, use WebSearch as a fallback for manual job discovery.

## Installation

```bash
cd .agents/skills/yenibiris-search/cli
bun install   # optional — only installs TypeScript dev types
```

The CLI runs without any install because it has zero runtime dependencies.

## Commands

| Command | Description |
|---------|-------------|
| `search` | Search for job listings |
| `detail` | Fetch full detail for a single job listing |

`search` accepts `--format json|table|plain` (default `json`); `detail` accepts `--format json|plain`.
All errors are written to **stderr** as `{ "error": "...", "code": "..." }` with exit code `1`.

## Quick examples

```bash
# Software roles in Istanbul
bun run src/cli.ts search -q "yazilim gelistirici" -c istanbul --format table

# Query-only search with pagination
bun run src/cli.ts search -q "backend" --page 2 --format json

# Full detail for one job
bun run src/cli.ts detail "https://www.yenibiris.com/is-ilani/yazilim-gelistirici-acme-teknoloji/1234567" --format plain
```

See `../SKILL.md` for the full flag reference.

## Search flags

| Flag | Alias | Description |
|------|-------|-------------|
| `--query` | `-q` | Keywords (title / skill / role). |
| `--city` | `-c` | City slug: `istanbul`, `ankara`, `izmir`, `bursa`, `antalya`, `kocaeli`. |
| `--page` | | 1-indexed page (`sayfa` param). |
| `--limit` | `-n` | Cap results emitted. |
| `--format` | | `json` \| `table` \| `plain`. |

## JSON output

Search:

```json
{ "meta": { "count": 10, "page": 1 }, "results": [{ "id", "title", "company", "location", "date", "url" }] }
```

Detail includes full `description` from JSON-LD plus optional `datePosted`, `employmentType`, `location`.

Optional env: `YENIBIRIS_COOKIE` or `JOBCRAFT_HTTP_COOKIE` if Cloudflare blocks.
