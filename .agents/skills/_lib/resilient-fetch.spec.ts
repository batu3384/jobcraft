import { describe, test, expect } from "bun:test"
import { looksLikeCloudflare, cookieFromEnv, ResilientFetchError } from "./resilient-fetch.ts"

describe("looksLikeCloudflare", () => {
  test("detects challenge markers", () => {
    expect(looksLikeCloudflare("Just a moment...")).toBe(true)
    expect(looksLikeCloudflare("cdn-cgi/challenge-platform")).toBe(true)
    expect(looksLikeCloudflare("__cf_chl_tk")).toBe(true)
    expect(looksLikeCloudflare("ok", 403)).toBe(true)
  })
  test("normal HTML is clean", () => {
    expect(looksLikeCloudflare("<html><body>job listings data-jk</body></html>", 200)).toBe(false)
  })
})

describe("cookieFromEnv", () => {
  test("returns first set env", () => {
    process.env.JOBCRAFT_TEST_COOKIE_A = ""
    process.env.JOBCRAFT_TEST_COOKIE_B = "cf_clearance=abc"
    expect(cookieFromEnv("JOBCRAFT_TEST_COOKIE_A", "JOBCRAFT_TEST_COOKIE_B")).toBe("cf_clearance=abc")
    delete process.env.JOBCRAFT_TEST_COOKIE_A
    delete process.env.JOBCRAFT_TEST_COOKIE_B
  })
})

describe("ResilientFetchError", () => {
  test("carries code", () => {
    const e = new ResilientFetchError("blocked", "CLOUDFLARE_BLOCKED")
    expect(e.code).toBe("CLOUDFLARE_BLOCKED")
  })
})
