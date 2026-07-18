# eleman-net-cli

CLI for searching jobs on [eleman.net](https://www.eleman.net) (Turkey).

**Data source**: SSR HTML search cards + JSON-LD `JobPosting` on detail pages.
**Authentication**: None required.
**Dependencies**: None (plain `bun` + shared `resilient-fetch`). `bun install` is optional and only pulls dev type defs.

> **Personal use only.** Keep volume low, don't use it commercially or for bulk data collection, and run it on your own responsibility.

## Installation

```bash
cd .agents/skills/eleman-net-search/cli
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
# Software roles in Istanbul (slug path)
bun run src/cli.ts search -q "yazilim muhendisi" -c istanbul --format table

# Query-only search with pagination
bun run src/cli.ts search -q "backend" --page 2 --format json

# Full detail for one job
bun run src/cli.ts detail "https://www.eleman.net/is-ilani/yazilim-muhendisi-i4707945" --format plain
```

See `../SKILL.md` for the full flag reference.

## Search flags

| Flag | Alias | Description |
|------|-------|-------------|
| `--query` | `-q` | Keywords (title / skill / role). |
| `--city` | `-c` | City slug: `istanbul`, `ankara`, `izmir`, `bursa`, `antalya`, `kocaeli`. |
| `--page` | | 1-indexed page (`sayfa` param or slug path query). |
| `--limit` | `-n` | Cap results emitted. |
| `--format` | | `json` \| `table` \| `plain`. |

## JSON output

Search:

```json
{ "meta": { "count": 10, "page": 1 }, "results": [{ "id", "title", "company", "location", "date", "url" }] }
```

Detail includes full `description` from JSON-LD plus optional `datePosted`, `employmentType`, `location`.

Optional env: `ELEMAN_COOKIE` or `JOBCRAFT_HTTP_COOKIE` if Cloudflare blocks.
