<p align="center">
  <img src="assets/jobcraft-mark.svg" alt="Jobcraft" width="96">
</p>

<h1 align="center">Jobcraft</h1>

<p align="center">
  <strong>AI-assisted job search and applications — local-first, built for Turkey.</strong>
</p>

<p align="center">
  <a href="https://github.com/batu3384">Batuhan Yüksel</a> · MIT License
</p>

---

Jobcraft is a workspace that runs on your machine. Search job boards, score fit against your profile, generate tailored CVs and cover letters (LaTeX → PDF), and track applications — without sending your data to a hosted service.

## Features

- **Profile onboarding** — `/setup` builds your candidate profile from documents or conversation
- **Multi-portal search** — Kariyer.net, Yenibiriş, Eleman.net, LinkedIn Jobs
- **Fit scoring** — `/rank` shortlists postings against your skills and goals
- **Application pipeline** — `/apply` drafts CV + cover letter and compiles PDFs
- **Interview prep** — `/interview` with STAR examples from your experience
- **Application tracking** — `/outcome`, `/html-report`, `/upskill`

## Quick start

```bash
git clone https://github.com/batu3384/jobcraft.git
cd jobcraft
./install.sh
```

Open the folder in **Cursor** (Agent chat). Type `/` to see commands: `setup`, `scrape`, `rank`, `apply`, …

```text
/setup          # first-time profile
/scrape         # search job boards
/apply <url>    # tailored CV + cover letter
```

**Yenibiriş** requires a one-time browser cookie (Cloudflare):

```bash
./scripts/setup-portal-auth.sh
./scripts/doctor.sh    # verify all four portals
```

Install details (Turkish): [`SETUP.md`](SETUP.md) · Cookie guide: [`docs/portal-authentication.md`](docs/portal-authentication.md)

> Keep personal contact data in `profile.local.md` (gitignored) or `documents/`. Run `/setup` to personalize template files.

## Workflow

```text
/setup  →  /scrape  →  /rank  →  /apply  →  /interview  →  /outcome
```

## Portal integrations

| Skill | Board | Notes |
|-------|--------|--------|
| `kariyer-net-search` | kariyer.net | Primary TR board |
| `yenibiris-search` | yenibiris.com | Cookie required |
| `eleman-net-search` | eleman.net | JSON-LD detail |
| `linkedin-search` | LinkedIn Jobs | `--location` filter |

Default scrape order: Kariyer → Yenibiriş → Eleman → LinkedIn → web fallback.

## Commands

| Command | Purpose |
|---------|---------|
| `/setup` | Build candidate profile |
| `/scrape` | Search installed portals |
| `/rank` | Score and shortlist |
| `/apply` | Tailored CV + cover letter |
| `/interview` | Interview preparation |
| `/outcome` | Record application results |
| `/upskill` | Skill-gap learning plan |
| `/html-report` | Offline application dashboard |
| `/add-portal` | Scaffold a new portal skill |
| `/add-template` | Register a custom LaTeX template |
| `/expand` | Enrich profile from documents |
| `/reset` | Reset profile or documents |

## Documentation

| Document | Language | Topic |
|----------|----------|--------|
| [`SETUP.md`](SETUP.md) | Turkish | Installation and first run |
| [`docs/portal-authentication.md`](docs/portal-authentication.md) | Turkish | Yenibiriş cookie setup |
| [`docs/tr-veri-konumlari.md`](docs/tr-veri-konumlari.md) | Turkish | Where data is stored locally |
| [`docs/tr-pazar-arastirmasi.md`](docs/tr-pazar-arastirmasi.md) | Turkish | Turkey job market notes |
| [`PROJE.md`](PROJE.md) | Turkish | Project overview |
| [`AGENTS.md`](AGENTS.md) | English | Workspace layout and agent integration |
| [`PROFILE.md`](PROFILE.md) | English | Candidate profile template |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | English | Contributing guidelines |

## Requirements

- macOS or Linux (Windows: manual setup — see `SETUP.md`)
- [Bun](https://bun.sh), Python 3, LaTeX (`lualatex` / `xelatex`)
- Optional: Chrome/Brave for Yenibiriş cookie sync

## License

MIT — Copyright (c) 2026 [Batuhan Yüksel](https://github.com/batu3384). See [`LICENSE`](LICENSE).
