#!/usr/bin/env bash
# Test Yenibiriş cookie and optionally enable the portal skill.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# shellcheck source=/dev/null
[[ -f scripts/jobcraft-env.sh ]] && source scripts/jobcraft-env.sh
# shellcheck source=/dev/null
[[ -f scripts/jobcraft-cookies.local.sh ]] && source scripts/jobcraft-cookies.local.sh

if [[ -z "${YENIBIRIS_COOKIE:-}" && -z "${JOBCRAFT_HTTP_COOKIE:-}" ]]; then
  echo "Hata: YENIBIRIS_COOKIE yok." >&2
  echo "" >&2
  echo "Kurulum:" >&2
  echo "  ./scripts/setup-portal-auth.sh" >&2
  echo "  docs/portal-authentication.md" >&2
  exit 1
fi

export PATH="$HOME/.bun/bin:$PATH"
OUT=$(bun run .agents/skills/yenibiris-search/cli/src/cli.ts search -q "yazilim" -c istanbul --limit 2 --format json 2>&1) || {
  echo "$OUT" >&2
  echo "" >&2
  echo "Cookie geçersiz veya süresi dolmuş." >&2
  echo "  Tarayıcıda yenibiris.com'u yenile → ./scripts/sync-yenibiris-cookie.sh" >&2
  echo "  Rehber: docs/portal-authentication.md" >&2
  exit 1
}

COUNT=$(echo "$OUT" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("meta",{}).get("count",0))')
if [[ "$COUNT" -lt 1 ]]; then
  echo "Uyarı: CLI çalıştı ama 0 sonuç. Cookie OK olabilir; sorguyu değiştir." >&2
  echo "$OUT"
  exit 0
fi

echo "OK — Yenibiriş cookie çalışıyor ($COUNT ilan)."
echo "$OUT" | python3 -c 'import sys,json; d=json.load(sys.stdin); r=d["results"][0]; print("Örnek:", r["title"], "|", r.get("company"), "|", r["url"])'
echo ""
echo "Tüm portallar: ./scripts/doctor.sh"
