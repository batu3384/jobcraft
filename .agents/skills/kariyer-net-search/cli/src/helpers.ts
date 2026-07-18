import {
  resilientHtmlFetch,
  cookieFromEnv,
  ResilientFetchError,
} from "../../../_lib/resilient-fetch.ts"

export const SEARCH_BASE = "https://www.kariyer.net/is-ilanlari"
export const SITE = "https://www.kariyer.net"
export const DESC_MAX = 12000

export interface JobCard {
  id: string
  title: string
  company: string
  location: string
  date: string
  url: string
  workType?: string
}

export interface JobDetail {
  id: string
  title: string
  company: string
  url: string
  description: string
  descriptionTruncated?: boolean
  meta?: { warning?: string }
}

export function isAllowedKariyerHost(hostname: string): boolean {
  const h = hostname.toLowerCase()
  return h === "www.kariyer.net" || h === "kariyer.net"
}

export function isAllowedKariyerUrl(url: string): boolean {
  try {
    return isAllowedKariyerHost(new URL(url).hostname)
  } catch {
    return false
  }
}

/** Resolve a kariyer.net job URL; rejects non-kariyer hosts (SSRF guard). */
export function resolveKariyerUrl(idOrUrl: string): string {
  if (idOrUrl.startsWith("http")) {
    if (!isAllowedKariyerUrl(idOrUrl)) {
      throw new Error(`URL must be on kariyer.net (got: ${idOrUrl})`)
    }
    return idOrUrl
  }
  if (idOrUrl.includes("/is-ilani/")) {
    const path = `${idOrUrl.startsWith("/") ? "" : "/"}${idOrUrl}`
    return `${SITE}${path}`
  }
  throw new Error(`Pass a full kariyer.net /is-ilani/... URL (got: ${idOrUrl})`)
}

export async function htmlFetch(url: string): Promise<string> {
  if (!isAllowedKariyerUrl(url)) {
    throw new Error(`Refusing fetch outside kariyer.net: ${url}`)
  }
  const cookie = cookieFromEnv("KARIYER_COOKIE", "JOBCRAFT_HTTP_COOKIE")
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

/** Parse SSR job cards from kariyer.net search HTML. */
export function parseJobCards(html: string): JobCard[] {
  const cards: JobCard[] = []
  const seen = new Set<string>()
  const re = /([\s\S]{0,1200}?)class="job-list-card-item"/g
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const head = m[1]
    const after = html.slice(m.index + m[0].length, m.index + m[0].length + 3500)
    const href = after.match(/href="(\/is-ilani\/[^"]+)"/)?.[1]
    if (!href) continue
    const idMatch = href.match(/-(\d+)$/)
    const id = idMatch?.[1] ?? href
    if (seen.has(id)) continue
    seen.add(id)
    const attr = (name: string) => head.match(new RegExp(`${name}="([^"]*)"`))?.[1] ?? ""
    const title =
      attr("positionName") ||
      after.match(/data-test="ad-card-title"[^>]*>([^<]+)/)?.[1]?.trim() ||
      ""
    const location = attr("cityName") || after.match(/data-test="location"[^>]*>([^<]+)/)?.[1]?.trim() || ""
    const workType = attr("workTypeText") || ""
    let company =
      after.match(/data-test="subtitle"[^>]*>\s*([^<]+)/)?.[1]?.trim() ||
      ""
    if (!company) {
      const texts = [...after.matchAll(/>([A-ZÇĞİÖŞÜ][^<]{4,80})</g)].map((x) => x[1].trim())
      company = texts.find((t) => t !== title && !t.includes("Sponsorlu") && t.length > 3) || ""
    }
    const date =
      after.match(/data-test="ad-date-item-date-other"[^>]*>([^<]+)/)?.[1]?.trim() ||
      after.match(/class="date[^"]*"[^>]*>([^<]+)/)?.[1]?.trim() ||
      ""
    cards.push({
      id,
      title,
      company,
      location,
      date,
      url: `${SITE}${href}`,
      workType: workType || undefined,
    })
  }
  return cards
}

const NAV_TITLE_NOISE = /iş\s*mi\s*arıyorsun|ilan\s*mı\s*vereceksiniz|keşfetmeye\s*devam/i

function cleanText(s: string): string {
  return s.replace(/\s+/g, " ").trim()
}

function isNavNoise(title: string): boolean {
  return !title || NAV_TITLE_NOISE.test(title) || /^aday\b/i.test(title)
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

/** Extract job title — never use broad data-test*="title" (matches nav CTAs first). */
export function parseDetail(html: string, url: string): JobDetail {
  const candidates: string[] = []
  const jobTitle = html.match(/data-test="job-title"[^>]*>([\s\S]*?)<\//)?.[1]
  if (jobTitle) candidates.push(cleanText(jobTitle.replace(/<[^>]+>/g, " ")))
  const og = html.match(/property="og:title"\s+content="([^"]+)"/)?.[1]
  if (og) {
    candidates.push(cleanText(og.replace(/\s*İş İlanı\s*-?\s*[\d.]*\s*$/i, "")))
  }
  const positionName = html.match(/positionName="([^"]+)"/)?.[1]
  if (positionName) candidates.push(cleanText(positionName))
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]
  if (h1) candidates.push(cleanText(h1.replace(/<[^>]+>/g, " ")))

  const title = candidates.find((t) => !isNavNoise(t)) || ""

  const company =
    cleanText(
      html.match(/data-test="company-title"[^>]*>([\s\S]*?)<\//)?.[1]?.replace(/<[^>]+>/g, " ") || "",
    ) ||
    cleanText(html.match(/data-test="[^"]*company[^"]*"[^>]*>([^<]+)/)?.[1] || "") ||
    ""

  const descBlock =
    html.match(/class="job-detail-container-description"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/)?.[1] ||
    html.match(/İş İlanı Hakkında[\s\S]{0,50}([\s\S]{200,8000}?)<\/div>/)?.[1] ||
    ""
  const fullDescription = stripHtmlToText(descBlock)
  const descriptionTruncated = fullDescription.length > DESC_MAX
  const description = fullDescription.slice(0, DESC_MAX)

  const id = url.match(/-(\d+)(?:\?|$)/)?.[1] || ""
  const detail: JobDetail = { id, title, company, url, description }
  if (descriptionTruncated) {
    detail.descriptionTruncated = true
    detail.meta = { warning: `description truncated at ${DESC_MAX} characters` }
  }
  if (!description) {
    detail.meta = {
      ...detail.meta,
      warning: [detail.meta?.warning, "no description block found in HTML"].filter(Boolean).join("; "),
    }
  }
  return detail
}
