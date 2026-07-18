---
name: yenibiris-search
version: 1.0.0
description: >
  Use this skill whenever the user wants to search Turkish jobs on Yenibiris.com,
  find iş ilanları, open positions in Istanbul/Ankara/Izmir/Bursa/Antalya/Kocaeli,
  or look up a yenibiris.com posting. Trigger phrases: yenibiris, yenibiris.com,
  iş ilanı, iş arama, açık pozisyon, İstanbul'da iş, yazılım geliştirici ilanı.
context: fork
enabled: true  # Cloudflare: cookie via scripts/sync-yenibiris-cookie.sh + curl_cffi fetch
allowed-tools: Bash(bun run .agents/skills/yenibiris-search/cli/src/cli.ts *)
---

# Yenibiris.com Search Skill

Search live job listings from [yenibiris.com](https://www.yenibiris.com) — a major Turkish job board. Zero runtime dependencies beyond `bun`.

## Personal use only

Keep volume low. Do not use commercially or for bulk harvesting. Own responsibility.

## Cloudflare

yenibiris.com is **Cloudflare-protected**. Without a browser session cookie, fetches fail with `[CLOUDFLARE_BLOCKED]`.

**User onboarding (do not duplicate here):** [`docs/portal-authentication.md`](../../../docs/portal-authentication.md)

Quick path:

```bash
./scripts/setup-portal-auth.sh        # status + guided setup
./scripts/sync-yenibiris-cookie.sh    # Chrome → jobcraft-cookies.local.sh
source scripts/jobcraft-env.sh
./scripts/test-yenibiris-cookie.sh
./scripts/doctor.sh                   # all 4 portals
```

Never commit cookies. Do not use CAPTCHA-solving services.

If blocked and no cookie is available, tell the user to run `./scripts/setup-portal-auth.sh` and fall back to **WebSearch** for manual discovery.

## Commands

```bash
bun run .agents/skills/yenibiris-search/cli/src/cli.ts search -q "yazilim gelistirici" -c istanbul --format table
bun run .agents/skills/yenibiris-search/cli/src/cli.ts detail "https://www.yenibiris.com/is-ilani/....../1234567" --format plain
```

Flags: `--query/-q`, `--city/-c`, `--page`, `--limit/-n`, `--format json|table|plain`.

When both `-q` and `-c` are set, search uses `/is-ilanlari/{city}?q={query}`. Query-only uses `?q=`. City-only uses `/is-ilanlari/{city}`.

`detail` only accepts `yenibiris.com` URLs (SSRF guard). JSON output includes full description from JSON-LD `JobPosting` when present.

Optional env (personal, never commit): `YENIBIRIS_COOKIE` or `JOBCRAFT_HTTP_COOKIE`.
