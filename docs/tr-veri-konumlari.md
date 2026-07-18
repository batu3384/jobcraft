# Veri nerede saklanır?

Jobcraft **tüm kişisel veriyi repo kökünde, yerel dosyalarda** tutar. Sunucu veya bulut yok; agent komutları bu dosyaları okur/yazar.

## Özet tablo

| Veri | Dosya / klasör | Git | Kim yazar? |
|------|------------------|-----|------------|
| Ana profil (PII) | `profile.local.md` | **Hayır** (gitignore) | Sen veya `/setup` |
| Yapılandırılmış profil | `.jobcraft/skills/job-application-assistant/01-*.md` | Evet (şablon); `/setup` sonrası **commit etme** | `/setup` |
| Portal cookie | `scripts/jobcraft-cookies.local.sh` | **Hayır** | `setup-portal-auth.sh` |
| Shell PATH | `scripts/jobcraft-env.sh` | **Hayır** | `./install.sh` |
| Taranan ilanlar | `job_scraper/seen_jobs.json` | **Hayır** | `/scrape`, `/rank` |
| Başvuru takibi | `job_search_tracker.csv` | **Hayır** | `/apply`, `/outcome` |
| Maaş benchmark | `salary_data.json` | **Hayır** | Sen veya salary aracı |
| Kaynak belgeler | `documents/cv/`, `linkedin/`, … | **Hayır** (içerik) | Sen |
| Başvuru arşivi | `documents/applications/<şirket>_<rol>/` | **Hayır** | `/apply`, `/outcome` |
| Üretilen CV (LaTeX) | `cv/main_<şirket>.tex` | **Hayır** | `/apply` |
| Üretilen ön yazı | `cover_letters/cover_<şirket>_<rol>.tex` | **Hayır** | `/apply` |
| PDF çıktılar | `*.pdf` (cv/, cover_letters/) | **Hayır** | LaTeX derlemesi |
| HTML dashboard | `reports/application-dashboard.html` | **Hayır** | `/html-report` |
| Upskill raporları | `upskill/report-*.md` | **Hayır** | `/upskill` |

## Akış diyagramı

```
documents/          →  /setup  →  profile.local.md + 01-07 profil dosyaları
                              ↓
/scrape             →  job_scraper/seen_jobs.json
/rank               →  seen_jobs.json (ranked/expired bayrakları)
/apply              →  cv/main_*.tex, cover_letters/cover_*.tex, PDF
                      job_search_tracker.csv (yeni satır)
/outcome            →  tracker + documents/applications/.../outcome.md
/html-report        →  reports/*.html
/upskill            →  upskill/report-*.md
```

## Klasör detayları

### `profile.local.md` (repo kökü)

Gerçek ad, telefon, e-posta, deneyim. Agent’lar varsa **önce bunu** okur. Şablon: `profile.local.md.example`.

### `job_scraper/seen_jobs.json`

`/scrape` her çalıştığında bulunan ilanların URL, şirket, başlık, tarih, durum (`new`, `ranked`, `skipped`, …). Tekrar göstermemek için dedup buradan yapılır.

- Şablon (repo’da): `job_scraper/seen_jobs.example.json`
- İlk kurulum: `./install.sh` kopyalar

### `job_search_tracker.csv`

Başvurduğun işlerin tablosu. Sütunlar: `date`, `company`, `role`, `status`, `cv_file`, `cover_letter_file`, …

- `/scrape` ve `/rank` buradaki şirket+rol’ü **tekrar önermez**
- `/outcome` mülakat/sonuç günceller
- Şablon: `job_search_tracker.example.csv`

### `documents/applications/<şirket>_<rol>/`

Her başvuru için arşiv:

- İlan metni / URL
- Gönderilen CV ve ön yazı kopyaları
- `outcome.md` — süreç notları

### `cv/` ve `cover_letters/`

- `main_example.tex` / `cover_example.tex` — şablon (repo’da)
- `main_<şirket>.tex`, `cover_<şirket>_<rol>.tex` — `/apply` üretir (**gitignore**)

### `reports/` ve `upskill/`

- `/html-report` → tek dosyalık offline dashboard
- `/upskill` → beceri boşluk analizi markdown raporları

### `scripts/jobcraft-cookies.local.sh`

Yenibiriş Cloudflare cookie’si. **Asla commit etme.** Kurulum: `./scripts/setup-portal-auth.sh` — rehber: [`portal-authentication.md`](portal-authentication.md).

## Güvenlik

- `.gitignore` kişisel çıktıları ve state dosyalarını dışlar
- CI `tools/security_guards.py` ile hassas dosyaların commit edilmediğini kontrol eder
- Public repo kullanıyorsan: `01-candidate-profile.md` ve `cv/main_example.tex` içine PII yazdıysan **commit etmeden önce** `git diff` kontrol et

## Yedekleme önerisi

Tüm değerli veri şu dosyalarda:

```
profile.local.md
job_scraper/seen_jobs.json
job_search_tracker.csv
salary_data.json
documents/**
cv/main_*.tex
cover_letters/cover_*.tex
reports/
upskill/
scripts/jobcraft-cookies.local.sh
```

Bunları periyodik olarak şifreli yedekle veya özel bir repo’da tut.
