import { htmlFetch, parseDetail, resolveElemanUrl, writeError } from "../helpers.js"

export interface DetailOpts {
  idOrUrl: string
  format: "json" | "plain"
}

export async function runDetail(opts: DetailOpts): Promise<number> {
  try {
    const url = resolveElemanUrl(opts.idOrUrl)
    const html = await htmlFetch(url)
    const detail = parseDetail(html, url)
    if (opts.format === "plain") {
      const warn = detail.meta?.warning ? `\n[warning] ${detail.meta.warning}\n` : ""
      const extra = [
        detail.datePosted ? `Posted: ${detail.datePosted}` : "",
        detail.employmentType ? `Type: ${detail.employmentType}` : "",
        detail.location ? `Location: ${detail.location}` : "",
      ]
        .filter(Boolean)
        .join("\n")
      process.stdout.write(
        `${detail.title}\n${detail.company}${extra ? `\n${extra}` : ""}\n${url}${warn}\n\n${detail.description}\n`,
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
