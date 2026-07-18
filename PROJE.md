# Jobcraft

Türkiye pazarına uyarlanmış, yerel çalışan AI iş arama ve başvuru workspace’i.

| Alan | Değer |
|------|-------|
| Proje adı | **Jobcraft** |
| Repo | https://github.com/batu3384/jobcraft |
| Hedef pazar | Türkiye (İstanbul öncelikli; remote OK) |
| Runtime | Cursor, Claude Code, Codex, Antigravity — bkz. `docs/agent-runtimes.md` |
| Framework | 1.2.2 |

## Durum

| Aşama | Durum |
|-------|-------|
| Upstream iz temizliği + rebrand | Tamam |
| TR pazar araştırması | `docs/tr-pazar-arastirmasi.md` |
| Tek komut kurulum | `./install.sh` |
| Profil | Şablon (`CLAUDE.md`); kişisel veri `CLAUDE.local.md` (gitignore) |
| Portallar (4) | Kariyer, Yenibiriş, Eleman.net, LinkedIn |
| Cookie onboarding | `scripts/setup-portal-auth.sh` + `docs/portal-authentication.md` |
| Salary sample | `salary_data.sample.json` (TRY) |
| Marka | `assets/jobcraft-mark.svg` |

## Portallar

| Skill | Rol |
|-------|-----|
| `kariyer-net-search` | Birincil TR board |
| `yenibiris-search` | Cookie gerekir (`docs/portal-authentication.md`) |
| `eleman-net-search` | eleman.net |
| `linkedin-search` | `-l "Istanbul, Turkey"` |

Öncelik: Kariyer → Yenibiriş → Eleman → LinkedIn → WebSearch.

## Atıf

[`NOTICE`](NOTICE) ve [`LICENSE`](LICENSE).
