#!/usr/bin/env bash
# Geriye uyumluluk — asıl kurulum: ./install.sh
exec "$(cd "$(dirname "$0")/.." && pwd)/install.sh" "$@"
