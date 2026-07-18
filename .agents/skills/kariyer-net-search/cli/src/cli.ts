#!/usr/bin/env bun
import { runSearch, type SearchOpts } from "./commands/search.js"
import { runDetail, type DetailOpts } from "./commands/detail.js"

interface Flags {
  _: string[]
  [k: string]: string | boolean | string[]
}

function parseFlags(argv: string[]): Flags {
  const flags: Flags = { _: [] }
  const alias: Record<string, string> = { q: "query", c: "city", n: "limit" }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith("--") || a.startsWith("-")) {
      const key = alias[a.replace(/^-+/, "")] ?? a.replace(/^-+/, "")
      const next = argv[i + 1]
      if (next === undefined || next.startsWith("-")) flags[key] = true
      else {
        flags[key] = next
        i++
      }
    } else (flags._ as string[]).push(a)
  }
  return flags
}

const HELP = `kariyer-net-cli — search jobs on kariyer.net (Turkey)

USAGE
  bun run src/cli.ts search [flags]
  bun run src/cli.ts detail <url> [--format json|plain]

SEARCH FLAGS
  --query, -q <text>   Keywords (e.g. yazilim muhendisi)
  --city, -c <text>    City slug (istanbul, ankara, izmir)
  --page <n>           Page number (default 1)
  --limit, -n <n>      Cap results
  --format <fmt>       json (default) | table | plain

Personal use only — keep volume low.
`

async function main(): Promise<number> {
  const flags = parseFlags(process.argv.slice(2))
  const cmd = (flags._ as string[])[0]
  if (!cmd || flags.help || flags.h) {
    process.stdout.write(HELP)
    return cmd ? 0 : 1
  }
  if (cmd === "search") {
    const opts: SearchOpts = {
      query: typeof flags.query === "string" ? flags.query : undefined,
      city: typeof flags.city === "string" ? flags.city : undefined,
      page: typeof flags.page === "string" ? Math.max(1, parseInt(flags.page, 10) || 1) : 1,
      limit: typeof flags.limit === "string" ? parseInt(flags.limit, 10) : undefined,
      format: (typeof flags.format === "string" ? flags.format : "json") as SearchOpts["format"],
    }
    return runSearch(opts)
  }
  if (cmd === "detail") {
    const idOrUrl = (flags._ as string[])[1]
    if (!idOrUrl) {
      process.stderr.write(JSON.stringify({ error: "detail requires a URL", code: "NO_URL" }) + "\n")
      return 1
    }
    const opts: DetailOpts = {
      idOrUrl,
      format: (typeof flags.format === "string" ? flags.format : "json") as DetailOpts["format"],
    }
    return runDetail(opts)
  }
  process.stderr.write(JSON.stringify({ error: `unknown command: ${cmd}`, code: "UNKNOWN_CMD" }) + "\n")
  return 1
}

main().then((code) => process.exit(code))
