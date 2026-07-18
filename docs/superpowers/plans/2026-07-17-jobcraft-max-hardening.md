> **⛔ DEPRECATED — do not execute.** This plan is archived history only.  
> **Current stack (2026-07):** `kariyer-net-search`, `yenibiris-search`, `eleman-net-search`, `linkedin-search`.  
> **Onboarding:** `docs/portal-authentication.md` · `./scripts/setup-portal-auth.sh` · `./scripts/doctor.sh`

# Jobcraft Max Hardening Implementation Plan

> **Historical (2026-07-17):** Several portals in this plan (Indeed, isbul, secretcv, freehire) were later removed.

> **For agentic workers:** Execute inline or via subagent-driven-development. Checkbox steps track progress. Do **not** commit unless the user asks (repo policy).

**Goal:** Complete Batuhan’s Jobcraft profile, harden TR portals with tests, add TRY salary sample, ship `isbul-search` + `secretcv-search`, polish docs/install/CI.

**Architecture:** Phase vertical slices (profile → portal quality → salary → new portals → polish). Portal CLIs follow linkedin-search contract. isbul uses public JSON API; secretcv uses HTML+curl like kariyer.

**Tech Stack:** Bun/TypeScript portal CLIs, Python salary tool, Markdown skill files, bash `install.sh`, GitHub Actions CI.

## Global Constraints

- No invented employers/degrees/skills — only `CLAUDE.md` / `01-candidate-profile.md` / CV
- Zero runtime deps on new portal CLIs (dev: typescript, @types/bun only)
- Personal-use warnings on scrapers; isbul API: still personal low volume
- No live portal E2E in CI
- No esube.iskur.gov.tr CLI
- `framework_version: 1.2.0` when new portals land
- Skip git commits unless user requests

---

### Task 1: Profile files (Faz 1)

**Files:**
- Modify: `.claude/skills/job-application-assistant/02-behavioral-profile.md`
- Modify: `.claude/skills/job-application-assistant/04-job-evaluation.md`
- Modify: `.claude/skills/job-application-assistant/05-cv-templates.md` (identity placeholders)
- Modify: `.claude/skills/job-application-assistant/06-cover-letter-templates.md`
- Modify: `.claude/skills/job-application-assistant/07-interview-prep.md`

- [ ] Fill 02/04/05/06/07 from Batuhan profile (no fiction)
- [ ] Verify: `rg '\[YOUR_' .claude/skills/job-application-assistant` — zero in filled identity/eval/STAR sections

---

### Task 2: Kariyer fixture tests + Indeed positioning (Faz 2)

**Files:**
- Create: `.agents/skills/kariyer-net-search/cli/tests/fixtures/search-sample.html`
- Create: `.agents/skills/kariyer-net-search/cli/tests/parsing.test.ts`
- Modify: `.agents/skills/indeed-tr-search/SKILL.md`
- Modify: `.claude/skills/job-scraper/search-queries.md`
- Modify: `docs/tr-pazar-arastirmasi.md`

- [ ] Write fixture + parsing tests; `bun test` in kariyer cli passes
- [ ] Document Indeed as fallback; WebSearch on CLOUDFLARE_BLOCKED

---

### Task 3: Salary TRY sample (Faz 3)

**Files:**
- Create: `salary_data.sample.json`
- Modify: `tools/README_SALARY_TOOL.md`
- Modify: `.claude/skills/job-application-assistant/04-job-evaluation.md` (salary skip note)
- Modify: `SETUP.md`

- [ ] Sample TRY data with `"sample": true` metadata
- [ ] Docs use İstanbul / TRY examples

---

### Task 4: `isbul-search` portal (Faz 4a)

**Files:**
- Create: `.agents/skills/isbul-search/**` (SKILL, url-reference, cli with search/detail, fixtures, tests)
- Mirror structure of `freehire-search` / `linkedin-search`

**API:** `GET https://www.isbul.net/api/agent/jobs?q=&limit=` → `{ data: [{ id, title, company, city, url, ... }] }`

- [ ] Implement CLI + map to `{ meta, results }`
- [ ] Fixture tests + typecheck
- [ ] Local smoke: `search -q yazilim` ≥1 result

---

### Task 5: `secretcv-search` portal (Faz 4b)

**Files:**
- Create: `.agents/skills/secretcv-search/**`
- Probe live HTML for card selectors; curl fetch like kariyer

- [ ] Implement parse + CLI
- [ ] Fixture tests
- [ ] Local smoke or document block + WebSearch path; `enabled: true` only if smoke OK

---

### Task 6: Wire install, CI, scrape, version (Faz 4–5)

**Files:**
- Modify: `install.sh` PORTALS
- Modify: `.github/workflows/ci.yml` matrix
- Modify: `README.md`, `PROJE.md`, `SETUP.md`, `docs/uyarlama-plani.md`, `CLAUDE.md`
- Bump `framework_version` to `1.2.0` across skill headers / AGENTS.md per repo convention
- Soften Danish wording in `.claude/commands/add-portal.md`

- [ ] `./install.sh` includes new portals
- [ ] CI matrix lists them; kariyer/isbul/secretcv require tests
- [ ] Docs consistent

---

### Task 7: Verification

- [ ] `python -m unittest discover -s tests -t .`
- [ ] `bun test` in kariyer, isbul, secretcv clis
- [ ] `python tools/lint_skills.py`
- [ ] Placeholder rg gate on profile files

---

## Spec coverage

| Spec section | Task |
|--------------|------|
| Faz 1 profile | 1 |
| Faz 2 kariyer/indeed | 2 |
| Faz 3 salary | 3 |
| Faz 4 isbul/secretcv | 4–5 |
| Faz 5 polish | 6 |
| Success criteria | 7 |
