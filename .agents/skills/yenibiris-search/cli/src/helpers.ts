import {
  resilientHtmlFetch,
  cookieFromEnv,
  ResilientFetchError,
} from "../../../_lib/resilient-fetch.ts"

export const SEARCH_BASE = "https://www.yenibiris.com/is-ilanlari"
export const SITE = "https://www.yenibiris.com"
export const DESC_MAX = 12000

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

export function isAllowedYenibirisHost(hostname: string): boolean {
  const h = hostname.toLowerCase()
  return h === "www.yenibiris.com" || h === "yenibiris.com"
}

export function isAllowedYenibirisUrl(url: string): boolean {
  try {
    return isAllowedYenibirisHost(new URL(url).hostname)
  } catch {
    return false
  }
}

/** Resolve a yenibiris.com job URL; rejects non-yenibiris hosts (SSRF guard). */
export function resolveYenibirisUrl(idOrUrl: string): string {
  if (idOrUrl.startsWith("http")) {
    if (!isAllowedYenibirisUrl(idOrUrl)) {
      throw new Error(`URL must be on yenibiris.com (got: ${idOrUrl})`)
    }
    return idOrUrl
  }
  if (idOrUrl.includes("/is-ilani/")) {
    const path = `${idOrUrl.startsWith("/") ? "" : "/"}${idOrUrl}`
    return `${SITE}${path}`
  }
  throw new Error(`Pass a full yenibiris.com /is-ilani/... URL (got: ${idOrUrl})`)
}

export async function htmlFetch(url: string): Promise<string> {
  if (!isAllowedYenibirisUrl(url)) {
    throw new Error(`Refusing fetch outside yenibiris.com: ${url}`)
  }
  const cookie = cookieFromEnv("YENIBIRIS_COOKIE", "JOBCRAFT_HTTP_COOKIE")
  if (cookie) {
    const script = new URL("../../../_lib/impersonate_fetch.py", import.meta.url).pathname
    const proc = Bun.spawn(["python3", script, url], {
      env: { ...process.env, COOKIE: cookie, YENIBIRIS_COOKIE: cookie },
      stdout: "pipe",
      stderr: "pipe",
    })
    const body = await new Response(proc.stdout).text()
    const err = await new Response(proc.stderr).text()
    const code = await proc.exited
    if (code === 0 && body.length >= 3000) return body
    const msg = err.trim() || `impersonate fetch failed (exit ${code})`
    throw new Error(`${msg} [FETCH_FAILED]`)
  }
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
  if (href.startsWith("http")) return href.split("?")[0] ?? href
  return `${SITE}${href.startsWith("/") ? "" : "/"}${href}`.split("?")[0] ?? href
}

function extractJobId(href: string): string {
  const m = href.match(/\/(\d+)(?:\?|$|\/)/) ?? href.match(/\/(\d+)$/)
  return m?.[1] ?? href
}

const JOB_LINK_RE =
  /href="((?:https?:\/\/(?:www\.)?yenibiris\.com)?\/is-ilani\/[^"]+\/\d+)"/gi

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

function extractTitleFromLinkBlock(block: string, href: string): string {
  const anchorMatch = block.match(
    new RegExp(`href="${href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>([\\s\\S]*?)<\\/a>`, "i"),
  )
  const inner = anchorMatch?.[1] ?? ""
  const fromInner =
    cleanText(inner.replace(/<[^>]+>/g, " ")) ||
    block.match(/title="([^"]+)"/)?.[1]?.trim() ||
    ""
  if (fromInner) return fromInner
  const h = block.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i)?.[1]
  return h ? cleanText(h.replace(/<[^>]+>/g, " ")) : ""
}

function extractCompanyAndLocation(afterLink: string): { company: string; location: string; date: string } {
  const textLines = afterLink
    .slice(0, 400)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "\n")
    .split("\n")
    .map((l) => cleanText(l))
    .filter((l) => l.length > 1 && !/^https?:\/\//i.test(l))

  let company = ""
  let location = ""
  let date = ""

  for (const line of textLines) {
    if (!company && line.length >= 2 && line.length <= 120 && !line.includes(" - ")) {
      company = line
      continue
    }
    if (!location && /\s-\s/.test(line) && line.length <= 80) {
      location = line
      continue
    }
    if (!date && /\d+\s*(gün|saat|ay|dakika)\s*(önce)?/i.test(line)) {
      date = line
    }
  }

  const companyFromClass =
    afterLink.match(/class="[^"]*company[^"]*"[^>]*>([\s\S]*?)<\//i)?.[1]?.replace(/<[^>]+>/g, " ") ?? ""
  const locationFromClass =
    afterLink.match(/class="[^"]*location[^"]*"[^>]*>([\s\S]*?)<\//i)?.[1]?.replace(/<[^>]+>/g, " ") ?? ""
  const dateFromClass = afterLink.match(/class="[^"]*date[^"]*"[^>]*>([^<]+)/i)?.[1]?.trim() ?? ""

  return {
    company: cleanText(companyFromClass || company),
    location: cleanText(locationFromClass || location),
    date: cleanText(dateFromClass || date),
  }
}

/** Parse SSR job cards from yenibiris.com search HTML. */
export function parseJobCards(html: string): JobCard[] {
  const cards: JobCard[] = []
  const seen = new Set<string>()
  let m: RegExpExecArray | null
  JOB_LINK_RE.lastIndex = 0
  while ((m = JOB_LINK_RE.exec(html)) !== null) {
    const href = m[1]
    if (/uye-girisi/i.test(href)) continue
    const id = extractJobId(href)
    if (seen.has(id)) continue
    seen.add(id)
    const start = Math.max(0, m.index - 200)
    const block = html.slice(start, m.index + 800)
    const title = extractTitleFromLinkBlock(block, href)
    const afterLink = html.slice(m.index, m.index + 600)
    const { company, location, date } = extractCompanyAndLocation(afterLink)
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
  const ogTitle = html.match(/property="og:title"\s+content="([^"]+)"/)?.[1]
  const title =
    cleanText(
      ogTitle?.replace(/\s*-\s*[^-]+$/, "").replace(/\s*İş İlanı\s*$/i, "").replace(/\s*-\s*[\d.]+\s*$/, "") ?? "",
    ) ||
    cleanText(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]+>/g, " ") ?? "")
  const company = cleanText(
    html.match(/class="[^"]*company[^"]*"[^>]*>([\s\S]*?)<\//i)?.[1]?.replace(/<[^>]+>/g, " ") ?? "",
  )
  const descBlock =
    html.match(/class="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i)?.[1] ??
    html.match(/İş Tanımı[\s\S]{0,80}([\s\S]{200,8000}?)<\/div>/i)?.[1] ??
    html.match(/class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i)?.[1] ??
    ""
  return {
    title,
    company,
    description: stripHtmlToText(descBlock),
  }
}

/** Parse job detail — prefers JSON-LD JobPosting, regex/HTML fallback. */
export function parseDetail(html: string, url: string): JobDetail {
  const id = url.match(/\/(\d+)(?:\?|$)/)?.[1] ?? url.match(/\/(\d+)$/)?.[1] ?? ""
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
