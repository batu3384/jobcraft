import { describe, test, expect } from "bun:test"
import { readFileSync } from "fs"
import { join } from "path"
import {
  parseJobCards,
  parseDetail,
  resolveElemanUrl,
  isAllowedElemanUrl,
  slugify,
} from "../src/helpers"
import { buildSearchUrl } from "../src/commands/search"

const searchFixture = readFileSync(join(import.meta.dir, "fixtures/search-sample.html"), "utf8")
const detailFixture = readFileSync(join(import.meta.dir, "fixtures/detail-jsonld-sample.html"), "utf8")

describe("slugify", () => {
  test("folds Turkish chars and hyphenates", () => {
    expect(slugify("Yazılım Mühendisi")).toBe("yazilim-muhendisi")
    expect(slugify("İstanbul")).toBe("istanbul")
    expect(slugify("Şişli")).toBe("sisli")
  })
})

describe("buildSearchUrl", () => {
  test("uses slug path when query and city provided", () => {
    expect(
      buildSearchUrl({ query: "yazilim muhendisi", city: "istanbul", page: 1, format: "json" }),
    ).toBe("https://www.eleman.net/is-ilanlari/istanbul/yazilim-muhendisi")
  })

  test("adds sayfa on slug path for page > 1", () => {
    expect(
      buildSearchUrl({ query: "backend", city: "ankara", page: 2, format: "json" }),
    ).toBe("https://www.eleman.net/is-ilanlari/ankara/backend?sayfa=2")
  })

  test("uses query fallback with plate code", () => {
    expect(buildSearchUrl({ query: "muhendis", city: "izmir", page: 1, format: "json" })).toBe(
      "https://www.eleman.net/is-ilanlari/izmir/muhendis",
    )
    expect(buildSearchUrl({ query: "muhendis", page: 3, format: "json" })).toBe(
      "https://www.eleman.net/is-ilanlari?aranan=muhendis&sayfa=3",
    )
    expect(buildSearchUrl({ city: "bursa", page: 1, format: "json" })).toBe(
      "https://www.eleman.net/is-ilanlari?sehir%5B0%5D=16",
    )
  })
})

describe("parseJobCards", () => {
  test("extracts id, title, company, location, url from fixture cards", () => {
    const cards = parseJobCards(searchFixture)
    expect(cards.length).toBe(2)
    expect(cards[0]).toMatchObject({
      id: "4707945",
      title: "Yazılım Mühendisi",
      company: "Cedetaş Elektronik A. Ş.",
      location: "İstanbul Anadolu",
      url: "https://www.eleman.net/is-ilani/yazilim-muhendisi-i4707945",
    })
    expect(cards[1]).toMatchObject({
      id: "1234567",
      title: "Backend Developer",
      company: "Acme Yazılım",
      location: "Ankara",
      date: "Bugün",
      url: "https://www.eleman.net/is-ilani/backend-developer-i1234567",
    })
  })

  test("skips cards without /is-ilani/ href", () => {
    const broken =
      searchFixture +
      `<div class="ilan_listeleme_bol"><h3 class="c-showcase-box__title">Broken</h3><span>no link</span></div>`
    const cards = parseJobCards(broken)
    expect(cards.length).toBe(2)
    expect(cards.every((c) => c.url.includes("/is-ilani/"))).toBe(true)
  })

  test("dedupes by job id", () => {
    expect(parseJobCards(searchFixture + searchFixture).length).toBe(2)
  })
})

describe("parseDetail", () => {
  test("pulls fields from JSON-LD JobPosting", () => {
    const d = parseDetail(
      detailFixture,
      "https://www.eleman.net/is-ilani/yazilim-muhendisi-i4707945",
    )
    expect(d.id).toBe("4707945")
    expect(d.title).toBe("Yazılım Mühendisi")
    expect(d.company).toBe("Cedetaş Elektronik A. Ş.")
    expect(d.datePosted).toBe("2026-07-15")
    expect(d.employmentType).toBe("FULL_TIME")
    expect(d.location).toBe("İstanbul Anadolu, TR")
    expect(String(d.description)).toContain("Python")
    expect(String(d.description)).not.toContain("<p>")
  })

  test("falls back to HTML when JSON-LD missing", () => {
    const html = `
      <h1>Senior Dev</h1>
      <div class="job-description"><p>Build <b>APIs</b> today</p></div>
    `
    const d = parseDetail(html, "https://www.eleman.net/is-ilani/x-i999")
    expect(d.id).toBe("999")
    expect(d.title).toBe("Senior Dev")
    expect(String(d.description)).toContain("Build")
    expect(d.meta?.warning).toMatch(/JSON-LD/)
  })
})

describe("resolveElemanUrl", () => {
  test("accepts eleman.net URLs", () => {
    expect(
      resolveElemanUrl("https://www.eleman.net/is-ilani/acme-yazilim-i123"),
    ).toBe("https://www.eleman.net/is-ilani/acme-yazilim-i123")
  })

  test("rejects off-site URLs", () => {
    expect(() => resolveElemanUrl("https://evil.example/is-ilani/x-i1")).toThrow(/eleman\.net/)
    expect(isAllowedElemanUrl("https://linkedin.com/jobs/1")).toBe(false)
  })

  test("resolves relative /is-ilani/ paths", () => {
    expect(resolveElemanUrl("/is-ilani/foo-bar-i99")).toBe("https://www.eleman.net/is-ilani/foo-bar-i99")
  })
})
