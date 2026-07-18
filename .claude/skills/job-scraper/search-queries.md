# Search Queries for Job Scraper

## Active profile (from `/setup`)

**Target titles:** Junior Software Developer, Full-Stack Developer, Backend Developer, Yazılım Mühendisi, Yazılım Geliştirici

**Primary skills in postings:** Python, TypeScript, FastAPI, Next.js, React, PostgreSQL

**Geography:** Istanbul (ideal), Ankara/İzmir (acceptable), remote/hybrid OK

## Installed portal CLIs (primary for `/scrape`)

`/scrape` discovers every portal skill under `.agents/skills/*/SKILL.md` with `enabled: true`.

### Priority order (Jobcraft Turkey)

1. **kariyer-net-search** — primary TR board (`-c istanbul`)
2. **yenibiris-search** — requires cookie (`./scripts/setup-portal-auth.sh`)
3. **eleman-net-search** — eleman.net
4. **linkedin-search** — `-l "Istanbul, Turkey"`

On CLI `CLOUDFLARE_BLOCKED` or empty `results`: run WebSearch **once** for that portal — do not retry-hammer the CLI.

**Block recovery order:** Kariyer → Yenibiriş → Eleman → LinkedIn → WebSearch (`site:` templates below).

## WebSearch fallback templates

```
site:kariyer.net "yazılım mühendisi" İstanbul
site:yenibiris.com "yazılım mühendisi" İstanbul
site:eleman.net yazılım İstanbul
site:linkedin.com/jobs "software engineer" Turkey
```

## Query categories

### Priority 1: Software / AI engineering

```
site:kariyer.net "yazılım mühendisi" İstanbul
site:yenibiris.com "yazılım mühendisi" İstanbul
site:eleman.net yazılım mühendisi İstanbul
site:linkedin.com/jobs "software engineer" Turkey
```

### Priority 2: Related tech

```
site:kariyer.net "backend" İstanbul
site:yenibiris.com "yazılım geliştirici" İstanbul
site:eleman.net yazılım geliştirici
site:linkedin.com/jobs "junior developer" Istanbul
```

### Location tiers

- Istanbul / İstanbul
- Ankara, İzmir
- Remote / hybrid

## Manual-only sources

Do **not** automate: `esube.iskur.gov.tr`. Use manual browse or WebSearch.
