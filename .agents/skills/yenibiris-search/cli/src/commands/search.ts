import { SEARCH_BASE, htmlFetch, parseJobCards, slugify, writeError, type JobCard } from "../helpers.js"

export interface SearchOpts {
  query?: string
  city?: string
  page: number
  limit?: number
  format: "json" | "table" | "plain"
}

export function buildSearchUrl(opts: SearchOpts): string {
  const query = opts.query?.trim()
  const cityKey = opts.city?.trim()

  if (query && cityKey) {
    const citySlug = slugify(cityKey)
    const params = new URLSearchParams()
    params.set("q", query)
    if (opts.page > 1) params.set("sayfa", String(opts.page))
    return `${SEARCH_BASE}/${citySlug}?${params.toString()}`
  }

  if (cityKey && !query) {
    const citySlug = slugify(cityKey)
    return opts.page > 1 ? `${SEARCH_BASE}/${citySlug}?sayfa=${opts.page}` : `${SEARCH_BASE}/${citySlug}`
  }

  const params = new URLSearchParams()
  if (query) params.set("q", query)
  if (opts.page > 1) params.set("sayfa", String(opts.page))
  const qs = params.toString()
  return qs ? `${SEARCH_BASE}?${qs}` : SEARCH_BASE
}

function renderTable(cards: JobCard[]): string {
  if (cards.length === 0) return "No results."
  const header = ["ID".padEnd(10), "TITLE".padEnd(40), "COMPANY".padEnd(28), "LOCATION".padEnd(16), "DATE"].join(" ")
  const rows = cards.map((c) =>
    [
      c.id.padEnd(10),
      (c.title || "").slice(0, 40).padEnd(40),
      (c.company || "—").slice(0, 28).padEnd(28),
      (c.location || "—").slice(0, 16).padEnd(16),
      c.date || "—",
    ].join(" "),
  )
  return [header, "-".repeat(header.length), ...rows].join("\n")
}

export async function runSearch(opts: SearchOpts): Promise<number> {
  try {
    const html = await htmlFetch(buildSearchUrl(opts))
    let cards = parseJobCards(html)
    if (opts.limit !== undefined && opts.limit >= 0) cards = cards.slice(0, opts.limit)
    if (opts.format === "table") process.stdout.write(renderTable(cards) + "\n")
    else if (opts.format === "plain") {
      process.stdout.write(
        cards
          .map((c) => `${c.title}\n  ${c.company || "—"} · ${c.location || "—"} · ${c.date || "—"}\n  ${c.url}`)
          .join("\n\n") + "\n",
      )
    } else {
      const meta: Record<string, unknown> = { count: cards.length, page: opts.page }
      if (cards.length === 0) {
        meta.warning =
          "no results — try broader keywords or city slugs (istanbul, ankara, izmir, bursa, antalya, kocaeli)"
      }
      process.stdout.write(JSON.stringify({ meta, results: cards }, null, 2) + "\n")
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "SEARCH_FAILED")
    return 1
  }
}
