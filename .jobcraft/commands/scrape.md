# /scrape - Search Job Portals

Run the Jobcraft job search workflow.

**Canonical spec:** follow [`.jobcraft/skills/job-scraper/SKILL.md`](../skills/job-scraper/SKILL.md) **exactly** — do not improvise portal flags or skip dedup.

**Bootstrap:** if `bun` is missing, run `./install.sh` then `source scripts/jobcraft-env.sh`.

**Yenibiriş:** if `YENIBIRIS_COOKIE` is unset, skip the Yenibiriş CLI and tell the user to run `./scripts/setup-portal-auth.sh` (see `docs/portal-authentication.md`). Continue other portals.

**Profile:** if `profile.local.md` exists, prefer it over placeholder sections in `PROFILE.md` / `01-candidate-profile.md`.

**Optional `$ARGUMENTS`:** focus area (e.g. `data science`) or `broad` for all query categories in `search-queries.md`.
