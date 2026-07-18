# Jobcraft — Kurulum Kontrol Listesi

## Tamamlanan

- [x] Jobcraft markası ve logo (`assets/`)
- [x] README, SETUP, PROJE, CONTRIBUTING
- [x] `./install.sh` + workspace state (`seen_jobs`, tracker, salary sample)
- [x] Profil şablonları + `CLAUDE.local.md` (gitignore)
- [x] Portallar: Kariyer, Yenibiriş, Eleman.net, LinkedIn
- [x] Yenibiriş cookie onboarding (`setup-portal-auth.sh`, `doctor.sh`)
- [x] `salary_data.sample.json` (TRY)
- [x] TR pazar araştırması (`docs/tr-pazar-arastirmasi.md`)
- [x] Cursor slash komutları (`.cursor/commands/`)

## İsteğe bağlı

- [ ] `salary_data.json` içine gerçek TRY benchmark
- [ ] Cookie süresi dolunca `./scripts/sync-yenibiris-cookie.sh`

## Portal sırası (varsayılan)

Kariyer → Yenibiriş → Eleman → LinkedIn → WebSearch
