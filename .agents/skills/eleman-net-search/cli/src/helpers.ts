import {
  resilientHtmlFetch,
  cookieFromEnv,
  ResilientFetchError,
} from "../../../_lib/resilient-fetch.ts"

export const SEARCH_BASE = "https://www.eleman.net/is-ilanlari"
export const SITE = "https://www.eleman.net"
export const DESC_MAX = 12000

export const CITY_PLATE: Record<string, number> = {
  istanbul: 34,
  ankara: 6,
  izmir: 35,
  bursa: 16,
  antalya: 7,
  kocaeli: 41,
}

export interface JobCard {
  id: string
  title: string
  company: string
  location: string
  date: string
  url: string
}

export interface JobDetail {
  id: string
  title: string
  company: string
  url: string
  description: string
  datePosted?: string
  employmentType?: string
  location?: string
  descriptionTruncated?: boolean
  meta?: { warning?: string }
}

export function slugify(text: string): string {
  return text
    .trim()
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function isAllowedElemanHost(hostname: string): boolean {
  const h = hostname.toLowerCase()
  return h === "www.eleman.net" || h === "eleman.net"
}

export function isAllowedElemanUrl(url: string): boolean {
  try {
    return isAllowedElemanHost(new URL(url).hostname)
  } catch {
    return false
  }
}

/** Resolve an eleman.net job URL; rejects non-eleman hosts (SSRF guard). */
export function resolveElemanUrl(idOrUrl: string): string {
  if (idOrUrl.startsWith("http")) {
    if (!isAllowedElemanUrl(idOrUrl)) {
      throw new Error(`URL must be on eleman.net (got: ${idOrUrl})`)
    }
    return idOrUrl
  }
  if (idOrUrl.includes("/is-ilani/")) {
    const path = `${idOrUrl.startsWith("/") ? "" : "/"}${idOrUrl}`
    return `${SITE}${path}`
  }
  throw new Error(`Pass a full eleman.net /is-ilani/... URL (got: ${idOrUrl})`)
}

export async function htmlFetch(url: string): Promise<string> {
  if (!isAllowedElemanUrl(url)) {
    throw new Error(`Refusing fetch outside eleman.net: ${url}`)
  }
  const cookie = cookieFromEnv("ELEMAN_COOKIE", "JOBCRAFT_HTTP_COOKIE")
  try {
    return await resilientHtmlFetch(url, {
      cookie,
      acceptLanguage: "tr-TR,tr;q=0.9,en;q=0.8",
      minBodyLength: 3000,
      maxRetries: 2,
    })
  } catch (e) {
    if (e instanceof ResilientFetchError) {
      throw new Error(`${e.message} [${e.code}]`)
    }
    throw e
  }
}

export function writeError(message: string, code: string): void {
  process.stderr.write(JSON.stringify({ error: message, code }) + "\n")
}

function normalizeJobUrl(href: string): string {
  if (href.startsWith("http")) return href
  return `${SITE}${href.startsWith("/") ? "" : "/"}${href}`
}

function extractJobId(href: string): string {
  const m = href.match(/-i(\d+)(?:\?|$|\/)/i) ?? href.match(/-i(\d+)$/i)
  return m?.[1] ?? href
}

function parseSubtitle(subtitleHtml: string): { company: string; location: string } {
  const text = subtitleHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  const parts = text.split(/\s*-\s*/)
  const company = parts[0]?.trim() ?? ""
  const location = parts.slice(1).join(" - ").trim()
  return { company, location }
}

/** Parse SSR job cards from eleman.net search HTML. */
export function parseJobCards(html: string): JobCard[] {
  const cards: JobCard[] = []
  const seen = new Set<string>()
  const re = /ilan_listeleme_bol/g
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const block = html.slice(m.index, m.index + 1200)
    const href =
      block.match(/href="(https?:\/\/(?:www\.)?eleman\.net\/is-ilani\/[^"]+)"/i)?.[1] ??
      block.match(/href="(\/is-ilani\/[^"]+)"/i)?.[1]
    if (!href) continue
    const id = extractJobId(href)
    if (seen.has(id)) continue
    seen.add(id)
    const title =
      block.match(/class="c-showcase-box__title[^"]*"[^>]*>([\s\S]*?)<\//)?.[1]?.replace(/<[^>]+>/g, " ").trim() ??
      block.match(/title="([^"]+)"/)?.[1]?.replace(/\s*iş ilanı\s*$/i, "").trim() ??
      ""
    const subtitleHtml =
      block.match(/class="c-showcase-box__subtitle[^"]*"[^>]*>([\s\S]*?)<\/span>/i)?.[1] ?? ""
    const { company, location } = parseSubtitle(subtitleHtml)
    const date =
      block.match(/class="[^"]*date[^"]*"[^>]*>([^<]+)/i)?.[1]?.trim() ??
      block.match(/data-date="([^"]+)"/)?.[1]?.trim() ??
      ""
    cards.push({
      id,
      title,
      company,
      location,
      date,
      url: normalizeJobUrl(href),
    })
  }
  return cards
}

function cleanText(s: string): string {
  return s.replace(/\s+/g, " ").trim()
}

function stripHtmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function orgName(org: unknown): string {
  if (!org || typeof org !== "object") return ""
  const o = org as Record<string, unknown>
  if (typeof o.name === "string") return cleanText(o.name)
  if (o.name && typeof o.name === "object") {
    const n = o.name as Record<string, unknown>
    if (typeof n.name === "string") return cleanText(n.name)
  }
  return ""
}

function jobLocationText(loc: unknown): string {
  if (!loc || typeof loc !== "object") return ""
  const l = loc as Record<string, unknown>
  if (typeof l.name === "string") return cleanText(l.name)
  const addr = l.address
  if (addr && typeof addr === "object") {
    const a = addr as Record<string, unknown>
    const parts = [a.addressLocality, a.addressRegion, a.addressCountry]
      .filter((x) => typeof x === "string")
      .map((x) => cleanText(x as string))
    return parts.join(", ")
  }
  if (Array.isArray(loc)) {
    return loc.map(jobLocationText).filter(Boolean).join("; ")
  }
  return ""
}

function extractJsonLdJobPosting(html: string): Record<string, unknown> | null {
  const scripts = [
    ...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi),
  ]
  for (const m of scripts) {
    try {
      const parsed = JSON.parse(m[1]) as unknown
      const items = Array.isArray(parsed) ? parsed : [parsed]
      for (const item of items) {
        if (!item || typeof item !== "object") continue
        const obj = item as Record<string, unknown>
        if (obj["@type"] === "JobPosting") return obj
        if (Array.isArray(obj["@graph"])) {
          const jp = obj["@graph"].find(
            (x) => x && typeof x === "object" && (x as Record<string, unknown>)["@type"] === "JobPosting",
          ) as Record<string, unknown> | undefined
          if (jp) return jp
        }
      }
    } catch {
      /* try next script block */
    }
  }
  return null
}

function parseDetailFallback(html: string): Partial<JobDetail> {
  const title =
    cleanText(html.match(/property="og:title"\s+content="([^"]+)"/)?.[1]?.replace(/\s*iş ilanı\s*$/i, "") ?? "") ||
    cleanText(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]+>/g, " ") ?? "")
  const company = cleanText(html.match(/class="[^"]*company[^"]*"[^>]*>([\s\S]*?)<\//i)?.[1]?.replace(/<[^>]+>/g, " ") ?? "")
  const descBlock =
    html.match(/class="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i)?.[1] ??
    html.match(/İş Tanımı[\s\S]{0,80}([\s\S]{200,8000}?)<\/div>/i)?.[1] ??
    ""
  return {
    title,
    company,
    description: stripHtmlToText(descBlock),
  }
}

/** Parse job detail — prefers JSON-LD JobPosting, regex/HTML fallback. */
export function parseDetail(html: string, url: string): JobDetail {
  const id = url.match(/-i(\d+)(?:\?|$|\/)/i)?.[1] ?? url.match(/-i(\d+)$/i)?.[1] ?? ""
  const jp = extractJsonLdJobPosting(html)
  const fallback = parseDetailFallback(html)

  let title = ""
  let company = ""
  let description = ""
  let datePosted: string | undefined
  let employmentType: string | undefined
  let location: string | undefined

  if (jp) {
    title = typeof jp.title === "string" ? cleanText(jp.title) : ""
    company = orgName(jp.hiringOrganization)
    if (typeof jp.description === "string") {
      description = stripHtmlToText(jp.description)
    }
    if (typeof jp.datePosted === "string") datePosted = jp.datePosted
    if (typeof jp.employmentType === "string") employmentType = jp.employmentType
    location = jobLocationText(jp.jobLocation)
  }

  if (!title) title = fallback.title ?? ""
  if (!company) company = fallback.company ?? ""
  if (!description) description = fallback.description ?? ""

  const descriptionTruncated = description.length > DESC_MAX
  const detail: JobDetail = {
    id,
    title,
    company,
    url,
    description: description.slice(0, DESC_MAX),
  }
  if (datePosted) detail.datePosted = datePosted
  if (employmentType) detail.employmentType = employmentType
  if (location) detail.location = location
  if (descriptionTruncated) {
    detail.descriptionTruncated = true
    detail.meta = { warning: `description truncated at ${DESC_MAX} characters` }
  }
  if (!description) {
    detail.meta = {
      ...detail.meta,
      warning: [detail.meta?.warning, "no description found in JSON-LD or HTML"].filter(Boolean).join("; "),
    }
  } else if (!jp) {
    detail.meta = {
      ...detail.meta,
      warning: [detail.meta?.warning, "JSON-LD JobPosting not found; used HTML fallback"].filter(Boolean).join("; "),
    }
  }
  return detail
}
