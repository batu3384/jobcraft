# yenibiris.com URL Reference

## Search

**Query + city** (preferred when both flags set):

```
https://www.yenibiris.com/is-ilanlari/{city-slug}?q={query}
```

Example: `https://www.yenibiris.com/is-ilanlari/istanbul?q=yazilim+gelistirici`

Pagination: `&sayfa={page}` (page > 1).

**Query only**:

```
https://www.yenibiris.com/is-ilanlari?q={query}
```

**City only**:

```
https://www.yenibiris.com/is-ilanlari/{city-slug}
```

**Category browse** (manual / future use):

```
https://www.yenibiris.com/is-ilanlari/bilgi-teknolojileri
```

Slugify: lowercase, Turkish chars folded (ı→i, ş→s, …), spaces → hyphens.

Supported city slugs: `istanbul`, `ankara`, `izmir`, `bursa`, `antalya`, `kocaeli`.

## Detail

```
https://www.yenibiris.com/is-ilani/{slug}/{numericId}
```

Example: `https://www.yenibiris.com/is-ilani/gayrimenkul-danismani-lotus-gayrimenkul/1182806`

Parse `application/ld+json` `JobPosting` for title, company, description, `datePosted`, `employmentType`, location. HTML fallback: `og:title`, `.job-description`, main content blocks.

## Search HTML

Job cards link to `/is-ilani/{slug}/{id}`:

- Title: link text or nearby heading
- Company: text line after title (before location)
- Location: line with `City - District` pattern (e.g. `Ankara - Gölbaşı`)

Skip `uye-girisi` and non-job links.

## Cloudflare

Site uses Cloudflare. Set `YENIBIRIS_COOKIE` or `JOBCRAFT_HTTP_COOKIE` from browser DevTools after visiting the site. CLI throws `[CLOUDFLARE_BLOCKED]` when challenge pages are detected.

## Notes

Only `yenibiris.com` / `www.yenibiris.com` hosts are fetched (SSRF guard).
