# Türkiye İş Pazarı — Portal Notları

> Jobcraft · 2026

## Özet

| Portal | Skill | Durum |
|--------|-------|-------|
| Kariyer.net | `kariyer-net-search` | Birincil; SSR HTML; detail |
| Yenibiriş | `yenibiris-search` | Aktif; Cloudflare cookie (`setup-portal-auth.sh`) |
| Eleman.net | `eleman-net-search` | JSON-LD detail; slug + query |
| LinkedIn | `linkedin-search` | `-l "Istanbul, Turkey"` |

## Öncelik sırası (`/scrape`)

1. Kariyer.net  
2. Yenibiriş  
3. Eleman.net  
4. LinkedIn  
5. WebSearch (portal CLI başarısız / boşsa)

## Yenibiriş

- Arama: `/is-ilanlari?q=` veya `/is-ilanlari/{city}?q=`
- Detay: `/is-ilani/{slug}/{id}`
- Cookie: [`portal-authentication.md`](portal-authentication.md)

## Eleman.net

- Arama: `/is-ilanlari/{city}/{query-slug}` veya `?aranan=&sehir[0]=`
- Detay: JSON-LD `JobPosting`
