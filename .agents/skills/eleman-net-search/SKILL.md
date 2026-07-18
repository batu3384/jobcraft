---
name: eleman-net-search
version: 1.0.0
description: >
  Use this skill whenever the user wants to search Turkish jobs on Eleman.net,
  find iş ilanları, open positions in Istanbul/Ankara/Izmir/Bursa/Antalya/Kocaeli,
  or look up an eleman.net posting. Trigger phrases: eleman.net, eleman net,
  iş ilanı, iş arama, açık pozisyon, İstanbul'da iş, yazılım mühendisi ilanı.
context: jobcraft
enabled: true
allowed-tools: Bash(bun run .agents/skills/eleman-net-search/cli/src/cli.ts *)
---

# Eleman.net Search Skill

Search live job listings from [eleman.net](https://www.eleman.net) — a major Turkish job board. Zero runtime dependencies beyond `bun`.

## Personal use only

Keep volume low. Do not use commercially or for bulk harvesting. Own responsibility.

## Commands

```bash
bun run .agents/skills/eleman-net-search/cli/src/cli.ts search -q "yazilim muhendisi" -c istanbul --format table
bun run .agents/skills/eleman-net-search/cli/src/cli.ts detail "https://www.eleman.net/is-ilani/....-i123" --format plain
```

Flags: `--query/-q`, `--city/-c`, `--page`, `--limit/-n`, `--format json|table|plain`.

When both `-q` and `-c` are set, search uses the slug path `/is-ilanlari/{city}/{query-slug}`. Otherwise it falls back to `?aranan=` and `sehir[0]=` plate codes.

`detail` only accepts `eleman.net` URLs (SSRF guard). JSON output includes full description from JSON-LD `JobPosting` when present.

Optional env (personal, never commit): `ELEMAN_COOKIE` or `JOBCRAFT_HTTP_COOKIE` if Cloudflare blocks.
