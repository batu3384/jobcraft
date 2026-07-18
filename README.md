<p align="center">
  <img src="assets/jobcraft-mark.svg" alt="Jobcraft" width="96">
</p>

<h1 align="center">Jobcraft</h1>

*The job search that runs on your machine — built for the Turkish market.*

An AI-powered job application workspace for Cursor and Claude Code. Fill in your profile, search Turkish and global job boards, score fit, tailor CVs and cover letters (LaTeX), and prepare for interviews.

> Independent project. Not affiliated with Anthropic. Claude Code and Cursor are toolchains this workflow uses.

## What this is

```
/setup          /scrape              /apply <url>
  |                |                     |
  v                v                     v
Fill in        Search TR +           Evaluate fit
your profile   global portals        Score & recommend
  |                |                     |
  v                v                     v
Profile        Present matches      Draft CV + cover letter
files ready    with fit ratings     (LaTeX, tailored)
```

## Quick start

```bash
git clone https://github.com/batu3384/jobcraft.git && cd jobcraft
./install.sh
```

`./install.sh` installs Bun, portal CLIs, poppler, TinyTeX, and workspace scaffolding (idempotent).

Then open this folder in **Cursor** or **Claude Code**:

```
/setup
/scrape
```

### Cursor: slash commands

In **Agent chat**, type `/` — Jobcraft lists commands from `.cursor/commands/` (`setup`, `scrape`, `apply`, `rank`, …). Each command loads the same workflow as Claude Code (thin pointer to `.claude/`).

Always-on routing: `.cursor/rules/jobcraft.mdc`.

**Yenibiriş (Cloudflare):** run `./scripts/setup-portal-auth.sh` once to set a browser cookie.  
**Health check:** `./scripts/doctor.sh` (all four portals).

Details: [`SETUP.md`](SETUP.md) (Turkish) · Cookie guide: [`docs/portal-authentication.md`](docs/portal-authentication.md)

> Repo ships **template** profile files. Run `/setup` to personalize. Keep real contact data in `CLAUDE.local.md` (gitignored) or `documents/`.

## Portal skills (Turkey-first)

| Skill | Board |
|-------|--------|
| `kariyer-net-search` | kariyer.net (primary) |
| `yenibiris-search` | yenibiris.com (requires cookie — see portal auth docs) |
| `eleman-net-search` | eleman.net |
| `linkedin-search` | LinkedIn Jobs (`--location`, e.g. `Istanbul, Turkey`) |

Scrape priority: Kariyer → Yenibiriş → Eleman → LinkedIn → WebSearch fallback.

## Main commands

| Command | Purpose |
|---------|---------|
| `/setup` | Build your candidate profile |
| `/scrape` | Search installed portals |
| `/rank` | Score and shortlist |
| `/apply` | Tailored CV + cover letter |
| `/interview` | Interview prep |
| `/outcome` | Track results |
| `/upskill` | Skill-gap plan |
| `/html-report` | Offline dashboard |
| `/add-portal` | Scaffold a new portal skill |
| `/add-template` | Register a custom LaTeX template |

## Documentation

| Doc | Language | Contents |
|-----|----------|----------|
| [`SETUP.md`](SETUP.md) | Turkish | Install and first-run |
| [`docs/portal-authentication.md`](docs/portal-authentication.md) | Turkish | Yenibiriş cookie / portal auth |
| [`PROJE.md`](PROJE.md) | Turkish | Project status |
| [`docs/tr-pazar-arastirmasi.md`](docs/tr-pazar-arastirmasi.md) | Turkish | Turkey market notes |
| [`docs/uyarlama-plani.md`](docs/uyarlama-plani.md) | Turkish | Adaptation checklist |
| [`docs/superpowers/`](docs/superpowers/) | Mixed (archived) | Do not execute — historical plans |
| [`docs/tr-veri-konumlari.md`](docs/tr-veri-konumlari.md) | Turkish | Where personal data is stored |
| [`docs/agent-runtimes.md`](docs/agent-runtimes.md) | English | Claude / Cursor / Codex / Antigravity |
| [`AGENTS.md`](AGENTS.md) | English | Agent bootstrap (all runtimes) |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | English | PR / verification |
| [`NOTICE`](NOTICE) | English | Upstream MIT attribution |

## License

MIT — see [`LICENSE`](LICENSE) and [`NOTICE`](NOTICE).
