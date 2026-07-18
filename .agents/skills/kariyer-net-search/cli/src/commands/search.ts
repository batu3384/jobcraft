import { SEARCH_BASE, htmlFetch, parseJobCards, writeError, type JobCard } from "../helpers.js"

export interface SearchOpts {
  query?: string
  city?: string
  page: number
  limit?: number
  format: "json" | "table" | "plain"
}

function buildUrl(opts: SearchOpts): string {
  const params = new URLSearchParams()
  // kariyer city facets are unreliable via `ct=`; fold city into keyword when provided
  const q = [opts.query, opts.city].filter(Boolean).join(" ").trim()
  if (q) params.set("kw", q)
  if (opts.page > 1) params.set("cp", String(opts.page))
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
    const html = await htmlFetch(buildUrl(opts))
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
        meta.warning = "no results — try broader keywords or different city spelling (e.g. istanbul / İstanbul)"
      }
      process.stdout.write(JSON.stringify({ meta, results: cards }, null, 2) + "\n")
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "SEARCH_FAILED")
    return 1
  }
}
