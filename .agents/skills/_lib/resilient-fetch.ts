/**
 * Shared resilient HTML fetch for Jobcraft portal CLIs.
 * Strategies (in order): curl → fetch, with optional session Cookie,
 * exponential backoff on 429/5xx. Detects Cloudflare challenge pages.
 *
 * Personal use: set portal cookie env (e.g. KARIYER_COOKIE) from your
 * browser after visiting the site — do not share cookies; never use
 * CAPTCHA-solving services.
 */

export class ResilientFetchError extends Error {
  code: string
  constructor(message: string, code: string) {
    super(message)
    this.code = code
  }
}

const DEFAULT_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

const CF_RE =
  /cf-mitigated|Just a moment|challenge-platform|cdn-cgi\/challenge|__cf_chl|cf-turnstile|turnstile|Attention Required|Enable JavaScript and cookies|cf-browser-verification/i

export function looksLikeCloudflare(html: string, status?: number): boolean {
  if (status === 403 || status === 503) {
    if (!html || html.length < 500) return true
    if (CF_RE.test(html)) return true
  }
  return CF_RE.test(html)
}

export interface ResilientFetchOpts {
  /** Cookie header value (e.g. from browser DevTools after solving CF once). */
  cookie?: string
  userAgent?: string
  acceptLanguage?: string
  /** Extra headers */
  headers?: Record<string, string>
  /** Max retries on 429/5xx (not on CF 403). Default 3. */
  maxRetries?: number
  /** Minimum body length to accept from curl before falling through. Default 500. */
  minBodyLength?: number
  /** If true, CF pages throw CLOUDFLARE_BLOCKED. Default true. */
  rejectCloudflare?: boolean
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function buildHeaderList(opts: ResilientFetchOpts): Record<string, string> {
  const h: Record<string, string> = {
    "User-Agent": opts.userAgent ?? DEFAULT_UA,
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": opts.acceptLanguage ?? "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    "Upgrade-Insecure-Requests": "1",
    ...(opts.headers ?? {}),
  }
  if (opts.cookie) h.Cookie = opts.cookie
  return h
}

async function curlFetch(url: string, opts: ResilientFetchOpts): Promise<{ body: string; status: number } | null> {
  const headers = buildHeaderList(opts)
  const args = ["curl", "-sL", "--compressed", "-A", headers["User-Agent"], "-w", "\n%{http_code}"]
  for (const [k, v] of Object.entries(headers)) {
    if (k === "User-Agent") continue
    args.push("-H", `${k}: ${v}`)
  }
  args.push(url)
  try {
    const proc = Bun.spawn(args, { stdout: "pipe", stderr: "pipe" })
    const raw = await new Response(proc.stdout).text()
    const code = await proc.exited
    if (code !== 0 || raw.length < 20) return null
    const nl = raw.lastIndexOf("\n")
    const body = nl >= 0 ? raw.slice(0, nl) : raw
    const status = parseInt(nl >= 0 ? raw.slice(nl + 1).trim() : "200", 10)
    return { body, status: Number.isFinite(status) ? status : 200 }
  } catch {
    return null
  }
}

/**
 * Fetch HTML with curl→fetch cascade, optional cookie, backoff on transient errors.
 */
export async function resilientHtmlFetch(url: string, opts: ResilientFetchOpts = {}): Promise<string> {
  const maxRetries = opts.maxRetries ?? 3
  const minLen = opts.minBodyLength ?? 500
  const rejectCf = opts.rejectCloudflare !== false
  let delay = 400
  let lastErr: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // Strategy A: curl
    const viaCurl = await curlFetch(url, opts)
    if (viaCurl) {
      const { body, status } = viaCurl
      if (rejectCf && looksLikeCloudflare(body, status)) {
        lastErr = new ResilientFetchError(
          "Blocked by Cloudflare challenge. Set a browser session cookie env (see portal SKILL.md) or use WebSearch fallback.",
          "CLOUDFLARE_BLOCKED",
        )
        // Cookie may help on next strategy; don't retry CF without cookie change
        break
      }
      if (status === 429 || status >= 500) {
        lastErr = new ResilientFetchError(`HTTP ${status}`, "HTTP_ERROR")
        if (attempt < maxRetries) {
          await sleep(delay + Math.floor(Math.random() * 300))
          delay = Math.min(delay * 2, 8000)
          continue
        }
      } else if (status >= 400 && body.length < minLen) {
        throw new ResilientFetchError(`HTTP ${status} fetching ${url}`, "HTTP_ERROR")
      } else if (body.length >= minLen) {
        // Accept body even on quirky statuses (some boards return 410 with full HTML)
        return body
      }
    }

    // Strategy B: fetch
    try {
      const res = await fetch(url, {
        headers: buildHeaderList(opts),
        redirect: "follow",
      })
      const text = await res.text()
      if (rejectCf && looksLikeCloudflare(text, res.status)) {
        throw new ResilientFetchError(
          "Blocked by Cloudflare challenge. Set a browser session cookie env (see portal SKILL.md) or use WebSearch fallback.",
          "CLOUDFLARE_BLOCKED",
        )
      }
      if (res.status === 429 || res.status >= 500) {
        lastErr = new ResilientFetchError(`HTTP ${res.status}`, "HTTP_ERROR")
        if (attempt < maxRetries) {
          await sleep(delay + Math.floor(Math.random() * 300))
          delay = Math.min(delay * 2, 8000)
          continue
        }
        throw lastErr
      }
      if (!res.ok && text.length < minLen) {
        throw new ResilientFetchError(`HTTP ${res.status} fetching ${url}`, "HTTP_ERROR")
      }
      if (text.length >= minLen || res.ok) return text
      throw new ResilientFetchError(`HTTP ${res.status} fetching ${url}`, "HTTP_ERROR")
    } catch (e) {
      if (e instanceof ResilientFetchError) throw e
      lastErr = e instanceof Error ? e : new Error(String(e))
      if (attempt < maxRetries) {
        await sleep(delay + Math.floor(Math.random() * 300))
        delay = Math.min(delay * 2, 8000)
        continue
      }
    }
  }

  if (lastErr instanceof ResilientFetchError) throw lastErr
  throw new ResilientFetchError(
    lastErr?.message ?? `could not fetch ${url}`,
    "FETCH_FAILED",
  )
}

/** Read cookie from env: first non-empty of the given names. */
export function cookieFromEnv(...names: string[]): string | undefined {
  for (const n of names) {
    const v = (process.env[n] ?? "").trim()
    if (v) return v
  }
  return undefined
}
