# Agent runtimes — Claude, Cursor, Codex, Antigravity

Jobcraft uses a **thin-pointer** layout: one canonical spec per workflow; each IDE loads it differently.

## Quick matrix

| Runtime | Entry point | Slash `/` menu | Portal CLIs |
|---------|-------------|----------------|-------------|
| **Claude Code** | `CLAUDE.md`, `AGENTS.md` | `.claude/commands/*.md` | `.agents/skills/*/SKILL.md` |
| **Cursor** | `.cursor/rules/`, `AGENTS.md` | **`.cursor/commands/*.md`** | same `.agents/skills/` |
| **OpenAI Codex** | `AGENTS.md` (repo root) | Codex CLI `/` if configured | `.agents/skills/` auto-discover |
| **Google Antigravity** | `AGENTS.md` | Antigravity skills UI | `.agents/skills/` (portable format) |
| **Gemini CLI** | `AGENTS.md` | project-dependent | `.agents/skills/` |

## Canonical directories (single source of truth)

```
.claude/commands/          # Workflow steps: setup, scrape, apply, rank, …
.claude/skills/            # Long-running skills: job-scraper, job-application-assistant, upskill
.agents/skills/            # Portal search CLIs (portable Agent Skills format)
CLAUDE.local.md            # Your real profile (gitignored)
docs/portal-authentication.md
```

**Do not copy workflow text** into Cursor/Codex docs — add a pointer to the `.claude/` file.

## Claude Code

1. Open repo in Claude Code
2. Type `/` → lists `.claude/commands/`
3. Skills auto-trigger from descriptions in `.claude/skills/*/SKILL.md`
4. Permissions: `.claude/settings.json`

## Cursor

1. Open repo in Cursor
2. Type `/` in **Agent chat** → lists `.cursor/commands/` (project) + `~/.cursor/commands` (global)
3. **Always-on context:** `.cursor/rules/jobcraft.mdc` routes workflows to `.claude/` specs
4. Same Bash as terminal: `source scripts/jobcraft-env.sh` before portal CLIs

Cursor commands are **thin wrappers** — they tell the agent which `.claude/` file to read.

## OpenAI Codex

Codex reads **`AGENTS.md`** at the repo root when working in this directory.

- Bootstrap, profile override, and thin-pointer rules are in `AGENTS.md`
- Portal skills: `.agents/skills/*/SKILL.md`
- For full apply/scrape steps, Codex should open the matching `.claude/commands/*.md` or `.claude/skills/*/SKILL.md`

## Google Antigravity

Antigravity discovers **`.agents/skills/`** in the portable Agent Skills format (`SKILL.md` per folder).

- `/scrape` orchestration: agent reads `.claude/skills/job-scraper/SKILL.md`
- Application workflow: `.claude/commands/apply.md` + `.claude/skills/job-application-assistant/`

## First run (all runtimes)

```bash
./install.sh
source scripts/jobcraft-env.sh
./scripts/setup-portal-auth.sh
./scripts/doctor.sh
```

Then: `/setup` → `/scrape` → `/apply <url>` (or natural language equivalent).

## Adding a new runtime

1. Point its project instructions file at `AGENTS.md`
2. Add thin slash-command files if the IDE supports them (like `.cursor/commands/`)
3. Never fork workflow logic — extend `.claude/commands/` or `.claude/skills/` only
