> **⛔ DEPRECATED — do not execute.** Archived design spec only.  
> **Current stack (2026-07):** Kariyer, Yenibiriş (cookie), Eleman, LinkedIn — see `docs/tr-pazar-arastirmasi.md`.

# Jobcraft Max-Scope Hardening — Design Spec

> **Historical:** Portal list below includes skills later removed (Indeed, isbul, secretcv, freehire).

**Date:** 2026-07-17  
**Status:** Draft for user review  
**Repo:** `~/Documents/jobcraft`  
**Upstream reference:** [MadsLorentzen/ai-job-search](https://github.com/MadsLorentzen/ai-job-search)  
**Approved direction:** Option 3 — Faz A–D + ikinci dalga portallar

## 1. Problem

Adversarial review showed Jobcraft has command/skill *parity* with upstream but fails the *quality bar* for a Turkey-first personal job workspace:

1. `/setup` incomplete — `02/04/05/06/07` still placeholders → weak `/apply` `/rank` `/interview`
2. TR portal CLIs under-tested; Indeed marketed as primary while Cloudflare often blocks
3. Salary tool still Denmark-shaped (DKK examples, no TRY sample)
4. Second-wave TR coverage (Secretcv / İŞKUR ecosystem) documented but not shipped
5. Docs drift (`PROJE.md` still says manual LaTeX after `./install.sh`)

## 2. Goals / Non-goals

### Goals

- Batuhan’s profile fully wired so `/apply` does not invent facts or leave `[YOUR_*]` in templates
- Kariyer (+ new portals) have fixture unit tests; CI does not silently skip empty test dirs for those tools
- Indeed positioned as **fallback**, not primary
- TRY salary sample + docs; missing `salary_data.json` → salary step skipped cleanly
- Ship `secretcv-search` (HTML) and `isbul-search` (public JSON API; İŞKUR-approved ÖİB)
- Docs / install / portal matrix consistent with reality

### Non-goals

- Apify or paid scrapers
- Live portal E2E in GitHub Actions
- Automating `esube.iskur.gov.tr` (ASP.NET + WAF; brittle) — document WebSearch/manual only
- Windows one-click installer (document manual path only)
- Rewriting git history / removing personal PII from private workspace (document public-fork scrub)

## 3. Architecture (phases)

```
Faz 1 Profil ──► Faz 2 Portal kalite ──► Faz 3 Salary TR
                                              │
                                              ▼
                                    Faz 4 Yeni portallar
                                              │
                                              ▼
                                         Faz 5 Cila
```

Each phase leaves the repo usable (`./install.sh` + `/scrape` + `/apply` path intact).

## 4. Faz 1 — Profile completion

**Sources of truth (no invented employers/degrees):**

- `CLAUDE.md`
- `.claude/skills/job-application-assistant/01-candidate-profile.md`
- `documents/cv/` if present

**Fill:**

| File | Content |
|------|---------|
| `02-behavioral-profile.md` | Junior builder / security-curious; structured work; autonomy; avoid pure ticket farms |
| `04-job-evaluation.md` | Primary: Python/TS/FastAPI/Next/Postgres/Docker; secondary: Go/Swift/security tools; goals: Istanbul FT junior full-stack / backend / security-minded software |
| `05-cv-templates.md` | Replace identity placeholders with Batuhan fields; keep moderncv structure |
| `06-cover-letter-templates.md` | Name/email/phone/LinkedIn |
| `07-interview-prep.md` | ≥3 STAR skeletons: Frostwall, DEU Student Support, ScreenTextGrab |

**Verify:** `rg '\[YOUR_|PLACEHOLDER' .claude/skills/job-application-assistant` → only intentional example blocks (ideally zero in identity sections).

## 5. Faz 2 — Portal quality

### Kariyer.net

- Add `cli/tests/fixtures/` minimal HTML with `job-list-card-item` cards
- Unit tests for `parseJobCards` / detail helpers (linkedin-search pattern)
- Keep curl-backed `htmlFetch`

### Indeed TR

- `SKILL.md` + `docs/tr-pazar-arastirmasi.md` + scrape guidance: **fallback**; on `CLOUDFLARE_BLOCKED` → WebSearch `site:tr.indeed.com` once, no retry hammer
- Fixture tests for parser if any; live smoke remains local-only
- Scrape skill / search-queries: Indeed below Kariyer/LinkedIn/isbul/secretcv

### CI

- Matrix includes all enabled portals
- For Kariyer, Secretcv, isbul: tests **required** (fail if no `*.test.ts`)
- LinkedIn/freehire/indeed: keep current “run if present” or require fixtures where parsers exist

## 6. Faz 3 — Salary TR

- Add `salary_data.sample.json` (TRY, Istanbul-oriented sample companies; synthetic indices OK if labeled `sample: true`)
- Update `tools/README_SALARY_TOOL.md` examples (no Novo/DKK as primary)
- `04-job-evaluation.md` salary section: if no `salary_data.json`, skip with one-line note
- Optional: copy-sample helper in SETUP (`cp salary_data.sample.json salary_data.json`)

`salary_data.json` stays gitignored.

## 7. Faz 4 — Second-wave portals

### `secretcv-search`

- Pattern: Kariyer-like Bun CLI (`search` / `detail`), zero runtime deps
- Fetch: curl fallback + browser UA
- Personal-use warning
- Fixture parse tests mandatory before enable
- Live smoke: one Istanbul yazılım query must return ≥1 result locally before merge to “enabled”

### `isbul-search` (İŞKUR ecosystem proxy)

- **Not** esube scrape
- Public API verified 2026-07-17: `GET https://www.isbul.net/api/agent/jobs?q=...&limit=...` returns `{ data: [...] }` with `id,title,company,city,url,...`
- Map to standard portal JSON shape
- Fixture or recorded JSON fixture tests
- Docs: “İŞKUR onaylı ÖİB (isbul.net); resmi esube için WebSearch/manuel”

### Wire-up

- `install.sh` `PORTALS=(...)` includes both
- CI matrix
- `.claude/skills/job-scraper/search-queries.md`
- `CLAUDE.md` / `PROJE.md` portal lists
- `framework_version` bump if required by repo convention (1.1.0 → 1.2.0 when portals land)

## 8. Faz 5 — Product polish

- Rewrite `PROJE.md` + `docs/uyarlama-plani.md` to match install.sh + new portals
- SETUP: Windows = out of scope for `./install.sh`; point to Bun/MiKTeX manual
- README: Indeed = fallback; isbul + secretcv listed
- Public-fork note: scrub phone/email from `CLAUDE.md` / `01` before publishing
- Remove stale “Danish skills” example wording in `add-portal.md` where cheap

## 9. Success criteria

| Check | Pass |
|-------|------|
| Profile placeholders | Identity/eval sections filled |
| `bun test` kariyer + secretcv + isbul | Pass |
| `./install.sh` | Idempotent green |
| Local smoke isbul | ≥1 result for `yazilim` |
| Local smoke secretcv | ≥1 result or documented CF/block with WebSearch path |
| Docs | No “install LaTeX by hand” as primary path |
| Salary | Sample exists; missing real file does not break apply |

## 10. Risks

| Risk | Mitigation |
|------|------------|
| Secretcv markup / bot wall | curl UA + fixtures; disable skill if live smoke fails |
| isbul API schema change | url-reference + fixture; version in SKILL |
| Profile over-claim | Only facts from CLAUDE/01/CV |
| Scope creep (Eleman.net, Yenibiris) | Out of this spec; backlog only |

## 11. Implementation order

1. Profile files  
2. Kariyer tests + Indeed positioning  
3. Salary sample + docs  
4. isbul-search (API — fastest reliable win)  
5. secretcv-search (HTML)  
6. install/CI/docs cila  
7. Local smokes + unittest/bun test  

---

**Next step after user approves this file:** write `docs/superpowers/plans/2026-07-17-jobcraft-max-hardening.md` and execute phase-by-phase.
