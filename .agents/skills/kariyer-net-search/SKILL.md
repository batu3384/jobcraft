---
name: kariyer-net-search
version: 1.0.0
description: >
  Use this skill whenever the user wants to search Turkish jobs on Kariyer.net,
  find iş ilanları, open positions in Istanbul/Ankara/Izmir, or look up a
  kariyer.net posting. Trigger phrases: kariyer.net, kariyer net, iş ilanı,
  iş arama, açık pozisyon, İstanbul'da iş, Ankara iş ilanı, yazılım mühendisi ilanı.
context: jobcraft
enabled: true
allowed-tools: Bash(bun run .agents/skills/kariyer-net-search/cli/src/cli.ts *)
---

# Kariyer.net Search Skill

Search live job listings from [kariyer.net](https://www.kariyer.net) — Turkey's largest general job board. Zero runtime dependencies beyond `bun`.

## Personal use only

Keep volume low. Do not use commercially or for bulk harvesting. Own responsibility.

## Commands

```bash
bun run .agents/skills/kariyer-net-search/cli/src/cli.ts search -q "yazilim muhendisi" -c istanbul --format table
bun run .agents/skills/kariyer-net-search/cli/src/cli.ts detail "https://www.kariyer.net/is-ilani/....-123" --format plain
```

Flags: `--query/-q`, `--city/-c`, `--page`, `--limit/-n`, `--format json|table|plain`.

`detail` only accepts `kariyer.net` URLs (SSRF guard). JSON output includes `meta.warning` when description is truncated or missing.

Optional env (personal, never commit): `KARIYER_COOKIE` or `JOBCRAFT_HTTP_COOKIE` if Cloudflare blocks.
