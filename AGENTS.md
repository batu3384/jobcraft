---
framework_version: 1.2.2
---

# Agent Guidelines: Jobcraft

This workspace is structured to manage job search activities, scraper tools, CVs, cover letters, and interview preparation.

## Bootstrap (one command)

If `bun`, `lualatex`, `xelatex`, or portal CLIs are missing, run from the repo root — do not ask the user to install tools piecemeal:

```bash
./install.sh
source scripts/jobcraft-env.sh   # non-login / agent shells
```

**Yenibiriş cookie missing?** Direct the user to `./scripts/setup-portal-auth.sh` and [`docs/portal-authentication.md`](docs/portal-authentication.md). Do not ask them to paste cookies into chat.

**Portal health:** `./scripts/doctor.sh` — live check for all four portals.

**Doc languages:** User-facing product docs: English (`README.md`, this file, `CONTRIBUTING.md`). Install / Turkey market docs: Turkish (`SETUP.md`, `PROJE.md`, `docs/portal-authentication.md`, `docs/tr-*.md`). Do not mix languages in one file.

## Thin-Pointer Design (Single Source of Truth)

To prevent duplication and configuration drift across different AI agent frameworks (Claude Code, Google Antigravity, Codex, Cursor, Gemini CLI, etc.), this workspace uses a unified thin-pointer design. All agent runtimes should load the canonical specifications and candidate profiles from the files and directories below:

1. **Personal Candidate Profile:**
   - Template: [CLAUDE.md](CLAUDE.md) and [.claude/skills/job-application-assistant/](.claude/skills/job-application-assistant/) (`01-*.md` etc.).
   - **Local override (gitignored):** if [CLAUDE.local.md](CLAUDE.local.md) exists, use it for real name, contact, and experience — never commit it.
2. **Canonical Workflow Specifications:**
   - The step-by-step instructions and triggers for tasks (setup, scrape, rank, apply, upskill, interview) are defined in the [.claude/](.claude/) directory (specifically under `.claude/skills/` and `.claude/commands/`).
   - Do not duplicate these rules or specifications. Treat `.claude/` files as the single source of truth.
3. **Portal Search Skills:**
   - Job-portal search CLIs live under [.agents/skills/](.agents/skills/) in the portable Agent Skills format (with a `SKILL.md` per portal). Codex and Antigravity discover these automatically; the `/scrape` workflow in [.claude/skills/job-scraper/](.claude/skills/job-scraper/) orchestrates them.

## Agent runtimes (Claude, Cursor, Codex, Antigravity)

| Runtime | How it loads Jobcraft |
|---------|------------------------|
| **Claude Code** | `CLAUDE.md` + `.claude/commands/` slash menu + `.claude/skills/` |
| **Cursor** | `.cursor/rules/jobcraft.mdc` + **`.cursor/commands/`** slash menu → thin pointers to `.claude/` |
| **OpenAI Codex** | `AGENTS.md` (this file) + `.agents/skills/` |
| **Google Antigravity** | `AGENTS.md` + `.agents/skills/` auto-discovery |

Details: [docs/agent-runtimes.md](docs/agent-runtimes.md)
