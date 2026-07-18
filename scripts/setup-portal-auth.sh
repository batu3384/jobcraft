#!/usr/bin/env bash
# Yenibiriş cookie kurulumu — durum, yönlendirme, opsiyonel sync/test.
# Tam rehber: docs/portal-authentication.md
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DOC="docs/portal-authentication.md"
EXAMPLE="scripts/jobcraft-cookies.local.sh.example"
COOKIE_FILE="scripts/jobcraft-cookies.local.sh"

usage() {
  cat <<EOF
Kullanım: ./scripts/setup-portal-auth.sh [komut]

Komutlar:
  (boş)      Durum + adım adım yönlendirme
  --status   Sadece cookie / bağımlılık durumu
  --sync     Chrome'dan cookie çek (sync-yenibiris-cookie.sh)
  --test     Cookie ile canlı arama testi
  --help     Bu metin

Rehber: $DOC
EOF
}

load_env() {
  # shellcheck source=/dev/null
  [[ -f scripts/jobcraft-env.sh ]] && source scripts/jobcraft-env.sh
  # shellcheck source=/dev/null
  [[ -f "$COOKIE_FILE" ]] && source "$COOKIE_FILE"
}

cookie_status() {
  if [[ -f "$COOKIE_FILE" ]]; then
    if [[ -n "${YENIBIRIS_COOKIE:-}" ]]; then
      printf '  cookie dosyası : var (%s karakter)\n' "${#YENIBIRIS_COOKIE}"
      if [[ "${YENIBIRIS_COOKIE}" == *"cf_clearance"* ]]; then
        printf '  cf_clearance   : var\n'
      else
        printf '  cf_clearance   : YOK (Cloudflare geçmemiş olabilir)\n'
      fi
    else
      printf '  cookie dosyası : var ama YENIBIRIS_COOKIE boş\n'
    fi
  else
    printf '  cookie dosyası : yok\n'
  fi
}

dep_status() {
  if python3 -c 'import curl_cffi' 2>/dev/null; then
    printf '  curl_cffi        : OK\n'
  else
    printf '  curl_cffi        : EKSİK (./install.sh)\n'
  fi
  if python3 -c 'import browser_cookie3' 2>/dev/null; then
    printf '  browser-cookie3  : OK\n'
  else
    printf '  browser-cookie3  : EKSİK (./install.sh)\n'
  fi
}

print_guide() {
  cat <<'EOF'

Yenibiriş — ilk kurulum
───────────────────────
1. Tarayıcıda https://www.yenibiris.com/is-ilanlari aç (Cloudflare geç)
2. Otomatik (Chrome/Brave/Arc/Edge):
     ./scripts/setup-portal-auth.sh --sync
3. Manuel (Safari/Firefox):
     cp scripts/jobcraft-cookies.local.sh.example scripts/jobcraft-cookies.local.sh
     # YENIBIRIS_COOKIE satırını doldur
4. Test:
     source scripts/jobcraft-env.sh
     ./scripts/setup-portal-auth.sh --test
5. Tüm portallar:
     ./scripts/doctor.sh

Cookie süresi dolunca --sync ile yenile.
EOF
  printf 'Detay: %s\n' "$DOC"
}

ensure_scaffold() {
  if [[ -f "$COOKIE_FILE" ]]; then
    return 0
  fi
  if [[ -f "$EXAMPLE" ]]; then
    cp "$EXAMPLE" "$COOKIE_FILE"
    chmod 600 "$COOKIE_FILE"
    printf 'Şablon oluşturuldu: %s\n' "$COOKIE_FILE"
  fi
}

cmd="${1:-}"

case "$cmd" in
  --help|-h)
    usage
    exit 0
    ;;
  --status)
    load_env
    printf '\nPortal auth durumu\n'
    cookie_status
    dep_status
    exit 0
    ;;
  --sync)
    ensure_scaffold
    exec "$ROOT/scripts/sync-yenibiris-cookie.sh"
    ;;
  --test)
    load_env
    exec "$ROOT/scripts/test-yenibiris-cookie.sh"
    ;;
  "")
    load_env
    printf '\n\033[1mJobcraft — portal kimlik doğrulama\033[0m\n\n'
    cookie_status
    dep_status
    if [[ -n "${YENIBIRIS_COOKIE:-}" ]]; then
      printf '\nCookie tanımlı. Canlı test için: ./scripts/setup-portal-auth.sh --test\n'
      printf 'Tüm portallar: ./scripts/doctor.sh\n'
    else
      ensure_scaffold
      print_guide
    fi
    ;;
  *)
    echo "Bilinmeyen komut: $cmd" >&2
    usage >&2
    exit 1
    ;;
esac
