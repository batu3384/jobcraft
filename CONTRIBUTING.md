# Contributing to Jobcraft

Jobcraft is a Turkey-market job-application workspace (MIT). Contributions that improve the TR workflow, portal CLIs, or documentation are welcome.

**Language:** Keep [`README.md`](README.md), [`AGENTS.md`](AGENTS.md), and this file in **English**. Keep [`SETUP.md`](SETUP.md), [`PROJE.md`](PROJE.md), and `docs/tr-*.md` / `docs/portal-*.md` in **Turkish**. Do not mix languages inside a single user-facing doc.

**Multi-runtime:** workflow logic lives only under `.claude/`; `.cursor/commands/` must stay thin pointers (see [`docs/agent-runtimes.md`](docs/agent-runtimes.md)).

## What belongs here

- Bug fixes in shared workflow commands/skills
- Improvements to Turkey portal CLIs (`kariyer-net-search`, `yenibiris-search`, `eleman-net-search`, `linkedin-search`)
- Documentation and LaTeX template fixes
- Tests and CI hardening

## What does not

- Personal profile data (`CLAUDE.local.md`, filled CVs, cover letters, tracker CSVs)
- Secrets, cookies, or scraped bulk datasets
- Unrelated market portals without a clear Jobcraft use case

## Verification before a PR

```bash
python3 tools/lint_skills.py
python3 tools/security_guards.py
python3 -m unittest discover -s tests -t . -v

for tool in linkedin-search kariyer-net-search yenibiris-search eleman-net-search; do
  (cd ".agents/skills/$tool/cli" && bun install && bun run typecheck)
done
```

Live portal hits are **not** required in CI; keep volume low for personal-use scrapers.

Optional local check (needs network + Yenibiriş cookie):

```bash
./scripts/doctor.sh
```

## License

By contributing you agree your changes are MIT-licensed under [`LICENSE`](LICENSE) / [`NOTICE`](NOTICE).
