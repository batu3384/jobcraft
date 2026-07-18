# /add-portal

Run the Jobcraft **add-portal** workflow in this repo.

Read and follow **exactly**: `.claude/commands/add-portal.md`

**Bootstrap:** if `bun` or LaTeX tools are missing, run `./install.sh` then `source scripts/jobcraft-env.sh`.

**Profile:** if `CLAUDE.local.md` exists, prefer it over placeholder templates in `CLAUDE.md` / `01-candidate-profile.md`.

**Yenibiriş:** never ask for cookies in chat — use `./scripts/setup-portal-auth.sh`.

Pass through any user arguments after the command as `$ARGUMENTS`.
