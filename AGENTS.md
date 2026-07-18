---
framework_version: 1.3.0
---

# Agent Guidelines: Jobcraft

This workspace manages job search, portal CLIs, CVs, cover letters, and interview preparation.

## Bootstrap

If `bun`, `lualatex`, `xelatex`, or portal CLIs are missing, run from the repo root:

```bash
./install.sh
source scripts/jobcraft-env.sh   # non-login / agent shells
```

**Yenibiriş cookie:** `./scripts/setup-portal-auth.sh` — see [`docs/portal-authentication.md`](docs/portal-authentication.md). Never ask the user to paste cookies in chat.

**Portal health:** `./scripts/doctor.sh`

## Documentation languages

- English: `README.md`, this file, `CONTRIBUTING.md`
- Turkish: `SETUP.md`, `PROJE.md`, `docs/portal-authentication.md`, `docs/tr-*.md`

## Workspace layout

| Path | Purpose |
|------|---------|
| `.claude/commands/` | Workflow specs (`setup`, `scrape`, `apply`, …) |
| `.claude/skills/` | Long-running skills (job-scraper, application assistant, upskill) |
| `.cursor/commands/` | Cursor slash commands (thin pointers to `.claude/`) |
| `.cursor/rules/jobcraft.mdc` | Always-on routing for Cursor Agent |
| `.agents/skills/` | Portal search CLIs (portable Agent Skills format) |
| `CLAUDE.local.md` | Personal profile override (gitignored) |

## Profile source of truth

1. `CLAUDE.local.md` if it exists (real name, contact, experience)
2. Else `CLAUDE.md` and `.claude/skills/job-application-assistant/01-*.md` (templates until `/setup`)

Do not duplicate workflow logic across runtimes — extend `.claude/commands/` or `.claude/skills/` only.

## Cursor

1. Open this folder in Cursor
2. Agent chat → `/` lists commands from `.cursor/commands/`
3. Each command reads the matching file under `.claude/`

## Other AI agents

Any agent that reads `AGENTS.md` and `.agents/skills/` can run portal CLIs. For full workflows (`/apply`, `/scrape`), open the corresponding `.claude/commands/*.md` or `.claude/skills/*/SKILL.md`.
