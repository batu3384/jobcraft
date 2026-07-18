# Jobcraft Kurulum

Tek komut (macOS / Linux). Windows için aşağıdaki “Windows” bölümüne bak.

## Kurulum

```bash
git clone https://github.com/batu3384/jobcraft.git
cd jobcraft
./install.sh
```

Bu script şunları kurar / doğrular:

| Ne | Neden |
|----|--------|
| Bun | Portal CLI’ler |
| Python 3 + openpyxl | Salary aracı |
| curl_cffi + browser-cookie3 | Yenibiriş (Cloudflare) |
| poppler (`pdftotext`) | ATS metin kontrolü |
| TinyTeX (`lualatex`, `xelatex`) + moderncv | `/apply` PDF |
| Shell PATH + `scripts/jobcraft-env.sh` | Yeni terminal / agent |
| Portal CLI’ler | kariyer, yenibiriş, eleman, linkedin |
| Cookie şablonu | `scripts/jobcraft-cookies.local.sh` |
| Workspace state | `job_scraper/seen_jobs.json`, `job_search_tracker.csv`, `salary_data.json` |

Tekrar çalıştırmak güvenli (idempotent).

### Windows

`./install.sh` Windows’u kapsamaz. Elle: [Bun](https://bun.sh), Python 3.10+, [MiKTeX](https://miktex.org/), poppler; sonra her `.agents/skills/*/cli` klasöründe `bun install`.

## İlk kurulum sonrası

```bash
./scripts/setup-portal-auth.sh   # Yenibiriş cookie (yönlendirmeli)
./scripts/doctor.sh              # 4 portal canlı kontrol
source scripts/jobcraft-env.sh   # agent / yeni shell
```

## Kullanım

### Cursor

1. Bu klasörü Cursor ile aç
2. **Agent chat**'te `/` yaz → `setup`, `scrape`, `apply`, … listelenir (`.cursor/commands/`)
3. Komut seç → agent `.claude/` içindeki asıl workflow'u çalıştırır

### Claude Code

Aynı workflow'lar; slash menü `.claude/commands/` altından gelir.

```
/setup          # profil şablonunu doldur
/scrape         # iş ara
/apply <url>    # CV + ön yazı
```

Repo’daki `CLAUDE.md` ve `01`–`07` dosyaları **şablondur**. Kişisel iletişim bilgisi için:

```bash
cp CLAUDE.local.md.example CLAUDE.local.md
# düzenle — gitignore’da, commit etme
```

Agent, varsa `CLAUDE.local.md` içeriğini şablona tercih eder.

## Portal cookie (Yenibiriş)

Dört portaldan yalnızca **Yenibiriş** cookie ister (Cloudflare). Kariyer, Eleman ve LinkedIn ek ayar gerektirmez.

Tam rehber: [`docs/portal-authentication.md`](docs/portal-authentication.md)

Hızlı yol (Chrome / Brave / Arc / Edge):

```bash
# 1. Tarayıcıda https://www.yenibiris.com/is-ilanlari aç (Cloudflare geç)
./scripts/sync-yenibiris-cookie.sh
source scripts/jobcraft-env.sh
./scripts/test-yenibiris-cookie.sh
```

Sihirbaz:

```bash
./scripts/setup-portal-auth.sh
```

`scripts/jobcraft-cookies.local.sh` gitignore’da — **commit etme**.

## Maaş verisi (opsiyonel)

```bash
cp salary_data.sample.json salary_data.json
# TRY benchmark’larını düzenle
python3 salary_lookup.py "Trendyol" --city "İstanbul"
```

`salary_data.json` gitignore’da. Yoksa `/apply` maaş adımını atlar.

## Veriler nerede?

Tüm kişisel state ve çıktıların konumu: [`docs/tr-veri-konumlari.md`](docs/tr-veri-konumlari.md)

## Başka portal eklemek

```
/add-portal https://example.com
```
