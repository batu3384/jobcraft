#!/usr/bin/env bash
# Pull yenibiris.com cookies from Chrome (after you log in) into jobcraft-cookies.local.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

python3 -m pip install browser-cookie3 --user -q 2>/dev/null || true

python3 <<'PY'
import sys
from pathlib import Path

try:
    import browser_cookie3 as bc
except ImportError:
    print("pip install browser-cookie3 gerekli", file=sys.stderr)
    sys.exit(1)

pairs = {}
browser = None
for name in ("chrome", "chromium", "brave", "edge", "arc"):
    loader = getattr(bc, name, None)
    if not loader:
        continue
    try:
        for c in loader(domain_name="yenibiris.com"):
            if c.name and c.value and "yenibiris" in (c.domain or "").lower():
                pairs[c.name] = c.value
        if pairs:
            browser = name
            break
    except Exception:
        continue

if not pairs:
    print("Chrome'da yenibiris.com çerezi bulunamadı.", file=sys.stderr)
    print("  1. Tarayıcıda https://www.yenibiris.com/is-ilanlari aç", file=sys.stderr)
    print("  2. Manuel: docs/portal-authentication.md (Yöntem B)", file=sys.stderr)
    sys.exit(1)

cookie = "; ".join(f"{k}={v}" for k, v in pairs.items())
out = Path("scripts/jobcraft-cookies.local.sh")
out.write_text(
    f"# Auto-sync from {browser} — do not commit.\nexport YENIBIRIS_COOKIE={cookie!r}\n",
    encoding="utf-8",
)
print(f"OK — {len(pairs)} cookie ({browser}) → {out}")
if "cf_clearance" not in pairs:
    print("Uyarı: cf_clearance yok — Cloudflare geçmemiş olabilirsin.", file=sys.stderr)
PY

chmod 600 scripts/jobcraft-cookies.local.sh
