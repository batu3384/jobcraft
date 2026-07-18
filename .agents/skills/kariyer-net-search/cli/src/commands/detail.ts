import { htmlFetch, parseDetail, resolveKariyerUrl, writeError } from "../helpers.js"

export interface DetailOpts {
  idOrUrl: string
  format: "json" | "plain"
}

export async function runDetail(opts: DetailOpts): Promise<number> {
  try {
    const url = resolveKariyerUrl(opts.idOrUrl)
    const html = await htmlFetch(url)
    const detail = parseDetail(html, url)
    if (opts.format === "plain") {
      const warn = detail.meta?.warning ? `\n[warning] ${detail.meta.warning}\n` : ""
      process.stdout.write(
        `${detail.title}\n${detail.company}\n${url}${warn}\n\n${detail.description}\n`,
      )
    } else {
      process.stdout.write(JSON.stringify(detail, null, 2) + "\n")
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "DETAIL_FAILED")
    return 1
  }
}
