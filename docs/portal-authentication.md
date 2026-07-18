# Portal kimlik doğrulama (cookie)

> Bu dosya Türkçe. Genel ürün özeti ve komut listesi için İngilizce [`README.md`](../README.md).

Jobcraft’ta **4 aktif portal** var. Çoğu ek ayar istemez; tek istisna **Yenibiriş** (Cloudflare).

| Portal | Cookie gerekir? | Not |
|--------|-----------------|-----|
| Kariyer.net | Hayır | Herkese açık HTML |
| Eleman.net | Hayır | Herkese açık HTML + JSON-LD |
| LinkedIn | Hayır* | Kamu iş arama sayfaları; rate limit olabilir |
| **Yenibiriş** | **Evet** | Cloudflare — tarayıcı oturumu gerekir |

\* LinkedIn için ayrı login cookie’si yok; skill kamu ilan sayfalarını kullanır.

## İlk kurulum (özet)

```bash
./install.sh
./scripts/setup-portal-auth.sh    # durum + yönlendirme
./scripts/doctor.sh               # 4 portal canlı kontrol
```

Agent / yeni terminal:

```bash
source scripts/jobcraft-env.sh
```

## Yenibiriş — neden cookie?

yenibiris.com istekleri Cloudflare ile korunur. CLI, tarayıcıdaki geçerli oturumu taklit etmek için `curl_cffi` + `YENIBIRIS_COOKIE` kullanır. Cookie **kişiseldir**, repoya **commit edilmez**.

Dosya: `scripts/jobcraft-cookies.local.sh` (gitignore’da). `scripts/jobcraft-env.sh` bu dosyayı otomatik yükler.

---

## Yöntem A — Otomatik senkron (önerilen)

Chrome, Brave, Arc veya Edge kullanıyorsanız:

1. Tarayıcıda [yenibiris.com/is-ilanlari](https://www.yenibiris.com/is-ilanlari) açın.
2. Cloudflare doğrulamasını geçin (gerekirse giriş yapın).
3. Repoda:

```bash
./scripts/sync-yenibiris-cookie.sh
source scripts/jobcraft-env.sh
./scripts/test-yenibiris-cookie.sh
```

`sync-yenibiris-cookie.sh` Chrome profilinizden `yenibiris.com` çerezlerini okur ve `scripts/jobcraft-cookies.local.sh` dosyasına yazar.

**Gereksinimler:** `browser-cookie3`, `curl_cffi` (`./install.sh` kurar). macOS’ta Chrome’un çerez deposuna erişim için ilk çalıştırmada **Tam Disk Erişimi** isteyebilir (Sistem Ayarları → Gizlilik).

---

## Yöntem B — Manuel (Safari / Firefox / sandbox)

1. Tarayıcıda siteyi açıp Cloudflare’i geçin.
2. Geliştirici araçları → **Application** → **Cookies** → `https://www.yenibiris.com`
3. Önemli çerezleri tek satırda birleştirin: `ad=değer; ad2=değer2`  
   Mümkünse `cf_clearance` dahil olsun.
4. Şablonu kopyalayıp düzenleyin:

```bash
cp scripts/jobcraft-cookies.local.sh.example scripts/jobcraft-cookies.local.sh
chmod 600 scripts/jobcraft-cookies.local.sh
# YENIBIRIS_COOKIE satırını doldurun
source scripts/jobcraft-env.sh
./scripts/test-yenibiris-cookie.sh
```

Alternatif: DevTools → Network → bir istek → **Request Headers** → `Cookie:` değerini kopyalayın.

---

## Süre dolumu ve yenileme

Cloudflare çerezleri (özellikle `cf_clearance`) **saatler–günler** içinde düşebilir.

Belirtiler:

- `./scripts/doctor.sh` → Yenibiriş FAIL
- CLI: `[CLOUDFLARE_BLOCKED]`
- `/scrape` özeti: Yenibiriş atlandı veya hata

Yenileme:

```bash
# Tarayıcıda yenibiris.com’u yenileyin, sonra:
./scripts/sync-yenibiris-cookie.sh   # veya manuel dosyayı güncelleyin
./scripts/test-yenibiris-cookie.sh
```

---

## Güvenlik

- `scripts/jobcraft-cookies.local.sh` **asla commit etmeyin** (`.gitignore`’da).
- Cookie’leri issue/PR/chat’e yapıştırmayın.
- CAPTCHA çözme servisleri kullanmayın — kişisel, düşük hacimli kullanım için tasarlandı.

Genel override (tüm portallar): `JOBCRAFT_HTTP_COOKIE` — nadiren gerekir; öncelik portal özel değişkenlerdedir (`YENIBIRIS_COOKIE`).

---

## Sorun giderme

| Sorun | Çözüm |
|-------|--------|
| `Chrome'da çerez bulunamadı` | Siteyi tarayıcıda açın; Yöntem B’ye geçin |
| `pip install browser-cookie3` | `./install.sh` tekrar çalıştırın |
| `curl_cffi` yok | `python3 -m pip install --user curl_cffi` |
| Test OK ama `/scrape` Yenibiriş yok | Agent shell’de `source scripts/jobcraft-env.sh` |
| Tam Disk Erişimi (macOS) | Sistem Ayarları → Gizlilik → Terminal/Cursor |

Yardımcı komutlar:

```bash
./scripts/setup-portal-auth.sh --status
./scripts/setup-portal-auth.sh --sync
./scripts/doctor.sh --json
```

---

## Agent notu

`/scrape` sırasında Yenibiriş `[CLOUDFLARE_BLOCKED]` verirse kullanıcıya **bu dosyayı** ve `./scripts/setup-portal-auth.sh` komutunu gösterin; cookie’yi sizin yerinize üretmeyin.
