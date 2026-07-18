# kariyer.net URL Reference

## Search

```
https://www.kariyer.net/is-ilanlari?kw=<query>&cp=<page>
```

- `kw` — Turkish keywords; **fold city into `kw`** when filtering by city (e.g. `yazilim muhendisi istanbul`)
- `ct` — city slug exists in the site UI but is **unreliable** for the CLI; do not rely on it
- `cp` — page (1-indexed)

## Detail

```
https://www.kariyer.net/is-ilani/<slug>-<id>
```

Title: prefer `data-test="job-title"` (not broad `*title*` — nav CTAs match first).
Company: `data-test="company-title"`. Also `og:title`.

## robots.txt

Public `/is-ilanlari` and `/is-ilani/` are not disallowed. Personal-account paths are.

## Notes

SSR HTML includes `job-list-card-item` nodes with `positionName`, `cityName`, and `/is-ilani/...` hrefs.
