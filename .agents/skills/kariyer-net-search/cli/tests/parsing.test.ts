import { describe, test, expect } from "bun:test"
import { readFileSync } from "fs"
import { join } from "path"
import { parseJobCards, parseDetail, resolveKariyerUrl, isAllowedKariyerUrl } from "../src/helpers"

const fixture = readFileSync(
  join(import.meta.dir, "fixtures/search-sample.html"),
  "utf8",
)

describe("parseJobCards", () => {
  test("extracts id, title, company, location, url from fixture cards", () => {
    const cards = parseJobCards(fixture)
    expect(cards.length).toBe(2)
    expect(cards[0]).toMatchObject({
      id: "12345",
      title: "Yazılım Mühendisi",
      company: "Örnek Teknoloji A.Ş.",
      location: "İstanbul",
      url: "https://www.kariyer.net/is-ilani/ornek-firma-yazilim-muhendisi-12345",
      workType: "Hibrit",
    })
    expect(cards[1].id).toBe("67890")
    expect(cards[1].title).toBe("Backend Developer")
  })

  test("skips cards without /is-ilani/ href", () => {
    const broken =
      fixture +
      `<div positionName="Broken" cityName="İzmir" class="job-list-card-item"><span>no link</span></div>`
    const cards = parseJobCards(broken)
    expect(cards.length).toBe(2)
    expect(cards.every((c) => c.url.includes("/is-ilani/"))).toBe(true)
  })

  test("dedupes by job id", () => {
    const dup = fixture + fixture
    expect(parseJobCards(dup).length).toBe(2)
  })
})

describe("parseDetail", () => {
  test("pulls title and strips description html", () => {
    const html = `
      <h1>Senior Dev</h1>
      <div class="job-detail-container-description"><p>Build <b>APIs</b> today</p></div>
      </div>
    `
    const d = parseDetail(html, "https://www.kariyer.net/is-ilani/x-999")
    expect(d.id).toBe("999")
    expect(d.title).toBe("Senior Dev")
    expect(String(d.description)).toContain("Build")
    expect(String(d.description)).not.toContain("<b>")
  })

  test("ignores nav CTA data-test titles (Aday / İş mi Arıyorsun)", () => {
    const html = readFileSync(
      join(import.meta.dir, "fixtures/detail-nav-pollution.html"),
      "utf8",
    )
    const d = parseDetail(html, "https://www.kariyer.net/is-ilani/medicana-saglik-grubu-yazilim-muhendisi-4489572")
    expect(d.title).toBe("Yazılım Mühendisi")
    expect(d.company).toBe("Medicana Sağlık Grubu")
    expect(String(d.title)).not.toMatch(/Aday|Arıyorsun/i)
    expect(String(d.description)).toContain("Build")
  })
})

describe("resolveKariyerUrl", () => {
  test("accepts kariyer.net URLs", () => {
    expect(
      resolveKariyerUrl("https://www.kariyer.net/is-ilani/acme-yazilim-123"),
    ).toBe("https://www.kariyer.net/is-ilani/acme-yazilim-123")
  })

  test("rejects off-site URLs", () => {
    expect(() => resolveKariyerUrl("https://evil.example/is-ilani/x-1")).toThrow(/kariyer\.net/)
    expect(isAllowedKariyerUrl("https://linkedin.com/jobs/1")).toBe(false)
  })

  test("resolves relative /is-ilani/ paths", () => {
    expect(resolveKariyerUrl("/is-ilani/foo-bar-99")).toBe("https://www.kariyer.net/is-ilani/foo-bar-99")
  })
})
