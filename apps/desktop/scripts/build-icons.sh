#!/usr/bin/env bash
# Generates platform icons from the source logo (1024x1024 PNG).
#   macOS  → assets/icon.icns  (via sips + iconutil)
#   Linux  → assets/icon.png   (512×512, via sips)
#   Windows→ assets/icon.ico   (via Node build-ico.js)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ASSETS="$SCRIPT_DIR/../assets"
LOGO="$SCRIPT_DIR/../../web/public/logo.png"

if [[ ! -f "$LOGO" ]]; then
  echo "❌ Source logo not found: $LOGO"
  exit 1
fi

echo ""
echo "🖼  Building icons from: $LOGO"
echo ""

# ── macOS .icns ───────────────────────────────────────────────────────────────

ICONSET="$ASSETS/icon.iconset"
mkdir -p "$ICONSET"

echo "→ Generating macOS iconset…"

declare -a SIZES=(16 32 128 256 512)
for size in "${SIZES[@]}"; do
  sips -z "$size" "$size" "$LOGO" --out "$ICONSET/icon_${size}x${size}.png"       > /dev/null 2>&1
  double=$((size * 2))
  if [[ $double -le 1024 ]]; then
    sips -z "$double" "$double" "$LOGO" --out "$ICONSET/icon_${size}x${size}@2x.png" > /dev/null 2>&1
  fi
done

iconutil -c icns "$ICONSET" -o "$ASSETS/icon.icns"
rm -rf "$ICONSET"
echo "✅ icon.icns"

# ── Linux .png (512×512) ──────────────────────────────────────────────────────

echo "→ Generating Linux PNG…"
sips -z 512 512 "$LOGO" --out "$ASSETS/icon.png" > /dev/null 2>&1
echo "✅ icon.png"

# ── Windows .ico (via Node) ───────────────────────────────────────────────────

echo "→ Generating Windows ICO…"
node "$SCRIPT_DIR/build-ico.js"

echo ""
echo "🎉 All icons ready in: $ASSETS"
echo ""
