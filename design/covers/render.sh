#!/bin/zsh
# Renders each cover HTML to public/covers/<slug>-v2.jpg (1200x1600). Usage: ./render.sh [slug...]
cd "${0:A:h}"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT=../../public/covers
for f in ${@:-*.html}; do
  s=${f%.html}; s=${s:t}
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --window-size=600,800 --force-device-scale-factor=2 \
    --virtual-time-budget=8000 --screenshot="${TMPDIR:-/tmp}/cover-$s.png" "file://$PWD/$s.html" >/dev/null 2>&1
  sips -s format jpeg -s formatOptions 88 "${TMPDIR:-/tmp}/cover-$s.png" --out "$OUT/$s-v2.jpg" >/dev/null && echo "$OUT/$s-v2.jpg"
done
