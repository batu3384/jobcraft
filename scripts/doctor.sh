#!/usr/bin/env bash
# Canlı portal sağlık kontrolü (4 aktif skill).
# JSON: ./scripts/doctor.sh --json
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${HOME}/.bun/bin:${PATH}"
# shellcheck source=/dev/null
[[ -f scripts/jobcraft-env.sh ]] && source scripts/jobcraft-env.sh

DOCTOR_JSON=0
[[ "${1:-}" == "--json" ]] && DOCTOR_JSON=1
export DOCTOR_JSON

python3 <<'PY'
import json, os, subprocess, sys

ROOT = os.getcwd()
JSON = os.environ.get("DOCTOR_JSON") == "1"

def run(args):
    p = subprocess.run(["bun", "run"] + args, capture_output=True, text=True, cwd=ROOT)
    return p.returncode, p.stdout, p.stderr

PORTALS = [
    {
        "id": "kariyer",
        "label": "Kariyer.net",
        "search": [".agents/skills/kariyer-net-search/cli/src/cli.ts", "search",
                   "-q", "yazilim", "-c", "istanbul", "--limit", "1", "--format", "json"],
        "fix": "Ağ / site erişimi kontrol et.",
    },
    {
        "id": "yenibiris",
        "label": "Yenibiriş",
        "search": [".agents/skills/yenibiris-search/cli/src/cli.ts", "search",
                   "-q", "yazilim", "-c", "istanbul", "--limit", "1", "--format", "json"],
        "fix": "./scripts/setup-portal-auth.sh — docs/portal-authentication.md",
        "needs_cookie": True,
    },
    {
        "id": "eleman",
        "label": "Eleman.net",
        "search": [".agents/skills/eleman-net-search/cli/src/cli.ts", "search",
                   "-q", "yazilim", "-c", "istanbul", "--limit", "1", "--format", "json"],
        "fix": "Ağ / site erişimi kontrol et.",
    },
    {
        "id": "linkedin",
        "label": "LinkedIn",
        "search": [".agents/skills/linkedin-search/cli/src/cli.ts", "search",
                   "-q", "yazilim", "-l", "Istanbul, Turkey", "--limit", "1", "--format", "json"],
        "fix": "Rate limit olabilir; biraz bekleyip tekrar dene.",
    },
]

DETAIL_CLI = {
    "kariyer": ".agents/skills/kariyer-net-search/cli/src/cli.ts",
    "yenibiris": ".agents/skills/yenibiris-search/cli/src/cli.ts",
    "eleman": ".agents/skills/eleman-net-search/cli/src/cli.ts",
    "linkedin": ".agents/skills/linkedin-search/cli/src/cli.ts",
}

cookie = os.environ.get("YENIBIRIS_COOKIE") or os.environ.get("JOBCRAFT_HTTP_COOKIE")
rows = []
all_ok = True

for portal in PORTALS:
    row = {"id": portal["id"], "label": portal["label"], "search": "fail", "detail": "skip", "note": ""}
    if portal.get("needs_cookie") and not cookie:
        row["search"] = "skip"
        row["detail"] = "skip"
        row["note"] = "cookie yok"
        all_ok = False
        rows.append(row)
        continue

    code, out, err = run(portal["search"])
    if code != 0:
        row["note"] = (err or out).strip().split("\n")[0][:120]
        all_ok = False
        rows.append(row)
        continue

    try:
        data = json.loads(out)
        results = data.get("results") or []
        count = data.get("meta", {}).get("count", len(results))
        if count < 1 or not results:
            row["note"] = "0 sonuç"
            all_ok = False
            rows.append(row)
            continue
        row["search"] = "ok"
        url = results[0].get("url") or results[0].get("jobUrl")
    except Exception as e:
        row["note"] = f"parse: {e}"
        all_ok = False
        rows.append(row)
        continue

    if not url:
        row["detail"] = "fail"
        row["note"] = "url yok"
        all_ok = False
        rows.append(row)
        continue

    cli = DETAIL_CLI[portal["id"]]
    code, out, err = run([cli, "detail", url, "--format", "json"])
    if code != 0:
        row["detail"] = "fail"
        row["note"] = (err or out).strip().split("\n")[0][:120]
        all_ok = False
    else:
        try:
            d = json.loads(out)
            desc = (d.get("description") or "").strip()
            if len(desc) > 50:
                row["detail"] = "ok"
                row["note"] = f"desc {len(desc)} chars"
            else:
                row["detail"] = "warn"
                row["note"] = f"kısa açıklama ({len(desc)} chars)"
        except Exception as e:
            row["detail"] = "fail"
            row["note"] = str(e)
            all_ok = False
    rows.append(row)

if JSON:
    print(json.dumps({"ok": all_ok, "portals": rows}, ensure_ascii=False, indent=2))
else:
    print()
    print("Jobcraft doctor — canlı portal kontrolü")
    print("─" * 52)
    for r in rows:
        s = r["search"]
        d = r["detail"]
        mark = "OK" if s == "ok" and d == "ok" else ("SKIP" if s == "skip" else "FAIL")
        sym = {"OK": "✓", "SKIP": "○", "FAIL": "✗"}.get(mark, "?")
        line = f"  {sym} {r['label']:<14} search={s:<4} detail={d:<4}"
        if r["note"]:
            line += f"  ({r['note']})"
        print(line)
    print()
    if all_ok:
        print("Tüm portallar hazır.")
    else:
        print("Bazı portallar hazır değil.")
        for p, r in zip(PORTALS, rows):
            if r["search"] != "ok" or r["detail"] not in ("ok", "warn"):
                print(f"  → {p['label']}: {p['fix']}")
    print()
    print("Yenibiriş cookie: ./scripts/setup-portal-auth.sh")
    print("Rehber: docs/portal-authentication.md")

sys.exit(0 if all_ok else 1)
PY
