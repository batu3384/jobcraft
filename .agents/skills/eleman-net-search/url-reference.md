# eleman.net URL Reference

## Search

**Preferred slug path** (when query + city):

```
https://www.eleman.net/is-ilanlari/{city-slug}/{query-slug}
```

Example: `https://www.eleman.net/is-ilanlari/istanbul/yazilim-muhendisi`

Pagination on slug path: `?sayfa={page}` (page > 1).

**Query fallback**:

```
https://www.eleman.net/is-ilanlari?aranan={query}&sehir[0]={plateCode}&sayfa={page}
```

City plate codes:

| City slug | Plate |
|-----------|-------|
| istanbul  | 34    |
| ankara    | 6     |
| izmir     | 35    |
| bursa     | 16    |
| antalya   | 7     |
| kocaeli   | 41    |

Slugify: lowercase, Turkish chars folded (ı→i, ş→s, …), spaces → hyphens.

## Detail

```
https://www.eleman.net/is-ilani/{slug}-i{id}
```

Example: `https://www.eleman.net/is-ilani/yazilim-muhendisi-i4707945`

Parse `application/ld+json` `JobPosting` for title, company, description, `datePosted`, `employmentType`, location. HTML regex fallback if JSON-LD missing.

## Search HTML

Cards live in `ilan_listeleme_bol` blocks:

- Link: `/is-ilani/...-i{id}`
- Title: `c-showcase-box__title`
- Company + location: `c-showcase-box__subtitle` (company before `-`, location after map icon)

## Notes

Only `eleman.net` / `www.eleman.net` hosts are fetched (SSRF guard).
