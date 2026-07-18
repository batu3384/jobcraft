#!/usr/bin/env python3
"""Fetch HTML with Chrome TLS impersonation (curl_cffi). For Cloudflare-protected boards.

Usage:
  COOKIE='a=b; c=d' python3 impersonate_fetch.py 'https://example.com/page'

Requires: pip install curl_cffi
Stdout: response body. Stderr: errors. Exit 0 on success, 1 on failure.
"""
from __future__ import annotations

import os
import sys


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: impersonate_fetch.py <url>", file=sys.stderr)
        return 1
    url = sys.argv[1]
    cookie = (os.environ.get("COOKIE") or os.environ.get("YENIBIRIS_COOKIE") or os.environ.get("JOBCRAFT_HTTP_COOKIE") or "").strip()
    if not cookie:
        print("missing COOKIE / YENIBIRIS_COOKIE / JOBCRAFT_HTTP_COOKIE", file=sys.stderr)
        return 1
    try:
        from curl_cffi import requests
    except ImportError:
        print("curl_cffi not installed — run: python3 -m pip install --user curl_cffi", file=sys.stderr)
        return 1
    try:
        r = requests.get(
            url,
            headers={
                "Cookie": cookie,
                "Accept-Language": os.environ.get("ACCEPT_LANGUAGE", "tr-TR,tr;q=0.9,en;q=0.8"),
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
            impersonate=os.environ.get("CURL_IMPERSONATE", "chrome131"),
            timeout=int(os.environ.get("FETCH_TIMEOUT", "45")),
        )
    except Exception as e:
        print(f"fetch failed: {e}", file=sys.stderr)
        return 1
    if r.status_code >= 400 and len(r.text) < 500:
        print(f"HTTP {r.status_code}", file=sys.stderr)
        return 1
    text = r.text or ""
    if "Just a moment" in text and "challenge-platform" in text:
        print("cloudflare challenge page (refresh browser cookie)", file=sys.stderr)
        return 1
    if len(text) < 500:
        print(f"body too short ({len(text)} bytes)", file=sys.stderr)
        return 1
    sys.stdout.write(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
