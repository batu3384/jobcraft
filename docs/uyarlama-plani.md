# Jobcraft — Türkiye Uyarlama Kontrol Listesi

## Tamamlanan

- [x] Upstream marka / DK portal / Pip / Ko-fi temizliği
- [x] Jobcraft README (EN), SETUP / PROJE / TR docs (TR), CONTRIBUTING, NOTICE
- [x] `./install.sh` + workspace state (`seen_jobs`, salary sample)
- [x] Profil şablonları + `CLAUDE.local.md` (gitignore)
- [x] Portallar: Kariyer, Yenibiriş, Eleman.net, LinkedIn
- [x] Indeed / Secretcv / isbul / freehire / DK CLI kaldırıldı
- [x] Yenibiriş cookie onboarding (`setup-portal-auth.sh`, `doctor.sh`)
- [x] `salary_data.sample.json` (TRY) + fallback
- [x] TR pazar araştırması
- [x] Public repo: https://github.com/batu3384/jobcraft

## İsteğe bağlı sonraki adımlar

- [ ] `salary_data.json` içine gerçek TRY benchmark
- [ ] Cookie süresi dolunca `./scripts/sync-yenibiris-cookie.sh`

## Portal sırası (varsayılan)

Kariyer → Yenibiriş → Eleman → LinkedIn → WebSearch
