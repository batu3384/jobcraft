import { describe, test, expect } from "bun:test"
import { readFileSync } from "fs"
import { join } from "path"
import {
  parseJobCards,
  parseDetail,
  resolveYenibirisUrl,
  isAllowedYenibirisUrl,
  slugify,
} from "../src/helpers"
import { buildSearchUrl } from "../src/commands/search"

const searchFixture = readFileSync(join(import.meta.dir, "fixtures/search-sample.html"), "utf8")
const detailFixture = readFileSync(join(import.meta.dir, "fixtures/detail-sample.html"), "utf8")

describe("slugify", () => {
  test("folds Turkish chars and hyphenates", () => {
    expect(slugify("Yazılım Geliştirici")).toBe("yazilim-gelistirici")
    expect(slugify("İstanbul")).toBe("istanbul")
    expect(slugify("Gölbaşı")).toBe("golbasi")
  })
})

describe("buildSearchUrl", () => {
  test("uses city path with q param when query and city provided", () => {
    expect(
      buildSearchUrl({ query: "yazilim gelistirici", city: "istanbul", page: 1, format: "json" }),
    ).toBe("https://www.yenibiris.com/is-ilanlari/istanbul?q=yazilim+gelistirici")
  })

  test("adds sayfa on city+q path for page > 1", () => {
    expect(
      buildSearchUrl({ query: "backend", city: "ankara", page: 2, format: "json" }),
    ).toBe("https://www.yenibiris.com/is-ilanlari/ankara?q=backend&sayfa=2")
  })

  test("query-only uses ?q=", () => {
    expect(buildSearchUrl({ query: "muhendis", page: 1, format: "json" })).toBe(
      "https://www.yenibiris.com/is-ilanlari?q=muhendis",
    )
    expect(buildSearchUrl({ query: "muhendis", page: 3, format: "json" })).toBe(
      "https://www.yenibiris.com/is-ilanlari?q=muhendis&sayfa=3",
    )
  })

  test("city-only uses city slug path", () => {
    expect(buildSearchUrl({ city: "bursa", page: 1, format: "json" })).toBe(
      "https://www.yenibiris.com/is-ilanlari/bursa",
    )
    expect(buildSearchUrl({ city: "izmir", page: 2, format: "json" })).toBe(
      "https://www.yenibiris.com/is-ilanlari/izmir?sayfa=2",
    )
  })
})

describe("parseJobCards", () => {
  test("extracts id, title, company, location, url from fixture cards", () => {
    const cards = parseJobCards(searchFixture)
    expect(cards.length).toBe(2)
    expect(cards[0]).toMatchObject({
      id: "1182806",
      title: "Gayrimenkul Danışmanı - Lotus Gayrimenkul",
      company: "REALTY WORLD",
      location: "Ankara - Gölbaşı",
      url: "https://www.yenibiris.com/is-ilani/gayrimenkul-danismani-lotus-gayrimenkul/1182806",
    })
    expect(cards[1]).toMatchObject({
      id: "1234567",
      title: "Yazılım Geliştirici",
      company: "Acme Teknoloji A.Ş.",
      location: "İstanbul - Kadıköy",
      date: "2 gün önce",
      url: "https://www.yenibiris.com/is-ilani/yazilim-gelistirici-acme-teknoloji/1234567",
    })
  })

  test("skips uye-girisi and non-job links", () => {
    const cards = parseJobCards(searchFixture)
    expect(cards.every((c) => c.url.includes("/is-ilani/"))).toBe(true)
    expect(cards.some((c) => c.id === "999")).toBe(false)
  })

  test("dedupes by job id", () => {
    expect(parseJobCards(searchFixture + searchFixture).length).toBe(2)
  })
})

describe("parseDetail", () => {
  test("pulls fields from JSON-LD JobPosting", () => {
    const d = parseDetail(
      detailFixture,
      "https://www.yenibiris.com/is-ilani/yazilim-gelistirici-acme-teknoloji/1234567",
    )
    expect(d.id).toBe("1234567")
    expect(d.title).toBe("Yazılım Geliştirici")
    expect(d.company).toBe("Acme Teknoloji A.Ş.")
    expect(d.datePosted).toBe("2026-07-10")
    expect(d.employmentType).toBe("FULL_TIME")
    expect(d.location).toBe("Kadıköy, İstanbul, TR")
    expect(String(d.description)).toContain("Python")
    expect(String(d.description)).not.toContain("<p>")
  })

  test("falls back to HTML when JSON-LD missing", () => {
    const html = `
      <meta property="og:title" content="Senior Dev İş İlanı - Acme" />
      <h1>Senior Dev</h1>
      <div class="job-description"><p>Build <b>APIs</b> today</p></div>
    `
    const d = parseDetail(html, "https://www.yenibiris.com/is-ilani/senior-dev-acme/999")
    expect(d.id).toBe("999")
    expect(d.title).toBe("Senior Dev")
    expect(String(d.description)).toContain("Build")
    expect(d.meta?.warning).toMatch(/JSON-LD/)
  })
})

describe("resolveYenibirisUrl", () => {
  test("accepts yenibiris.com URLs", () => {
    expect(
      resolveYenibirisUrl(
        "https://www.yenibiris.com/is-ilani/gayrimenkul-danismani-lotus-gayrimenkul/1182806",
      ),
    ).toBe("https://www.yenibiris.com/is-ilani/gayrimenkul-danismani-lotus-gayrimenkul/1182806")
  })

  test("rejects off-site URLs", () => {
    expect(() => resolveYenibirisUrl("https://evil.example/is-ilani/x/1")).toThrow(/yenibiris\.com/)
    expect(isAllowedYenibirisUrl("https://linkedin.com/jobs/1")).toBe(false)
  })

  test("resolves relative /is-ilani/ paths", () => {
    expect(resolveYenibirisUrl("/is-ilani/foo-bar/99")).toBe("https://www.yenibiris.com/is-ilani/foo-bar/99")
  })
})
