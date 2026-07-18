# Contributing to Jobcraft

Jobcraft is an MIT-licensed job-application workspace for the Turkey market. Contributions that improve portal CLIs, workflows, or documentation are welcome.

**Languages:** `README.md`, `AGENTS.md`, and this file in **English**. `SETUP.md`, `PROJE.md`, and `docs/tr-*.md` / `docs/portal-*.md` in **Turkish**.

**Architecture:** Workflow logic lives under `.claude/`. `.cursor/commands/` must stay thin pointers.

## What belongs here

- Bug fixes in workflow commands and skills
- Improvements to Turkey portal CLIs (`kariyer-net-search`, `yenibiris-search`, `eleman-net-search`, `linkedin-search`)
- Documentation and LaTeX template fixes
- Tests and CI hardening

## What does not

- Personal profile data (`CLAUDE.local.md`, filled CVs, cover letters, tracker CSVs)
- Secrets, cookies, or scraped bulk datasets

## Verification before a PR

```bash
python3 tools/lint_skills.py
python3 tools/security_guards.py
python3 -m unittest discover -s tests -t . -v

for tool in linkedin-search kariyer-net-search yenibiris-search eleman-net-search; do
  (cd ".agents/skills/$tool/cli" && bun install && bun run typecheck)
done
```

Optional local portal check (network + Yenibiriş cookie):

```bash
./scripts/doctor.sh
```

## License

By contributing you agree your changes are MIT-licensed under [`LICENSE`](LICENSE).
