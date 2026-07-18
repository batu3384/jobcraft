# Jobcraft

Türkiye pazarına yönelik, yerelde çalışan AI destekli iş arama ve başvuru workspace’i.

| Alan | Değer |
|------|-------|
| Geliştirici | [Batuhan Yüksel](https://github.com/batu3384) |
| Repo | https://github.com/batu3384/jobcraft |
| Lisans | MIT |
| Hedef pazar | Türkiye (İstanbul öncelikli; remote OK) |
| Framework | 1.3.0 |

## Özellikler

| Bileşen | Durum |
|---------|--------|
| Tek komut kurulum | `./install.sh` |
| Cursor slash komutları | `.cursor/commands/` |
| Profil | `/setup` + `profile.local.md` (gitignore) |
| Portallar (4) | Kariyer, Yenibiriş, Eleman.net, LinkedIn |
| Cookie onboarding | `scripts/setup-portal-auth.sh` |
| Başvuru PDF | LaTeX (moderncv + ön yazı şablonu) |
| Marka | `assets/jobcraft-mark.svg` |

## Portallar

| Skill | Rol |
|-------|-----|
| `kariyer-net-search` | Birincil TR board |
| `yenibiris-search` | Cookie gerekir — `docs/portal-authentication.md` |
| `eleman-net-search` | eleman.net |
| `linkedin-search` | `-l "Istanbul, Turkey"` |

Öncelik: Kariyer → Yenibiriş → Eleman → LinkedIn → WebSearch.

## Dokümantasyon

- Kurulum: [`SETUP.md`](SETUP.md)
- Veri konumları: [`docs/tr-veri-konumlari.md`](docs/tr-veri-konumlari.md)
- Pazar notları: [`docs/tr-pazar-arastirmasi.md`](docs/tr-pazar-arastirmasi.md)
