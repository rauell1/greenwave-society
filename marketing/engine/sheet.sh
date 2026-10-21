#!/bin/sh
# Contact sheet: render a still every second of a page at a size, tile them.
#   sh engine/sheet.sh films/anthem 1920x1080 out/sheets/anthem-16x9.jpg [cols]
set -e
PAGE=$1; SIZE=$2; OUT=$3; COLS=${4:-6}
TMP=$(mktemp -d)
node engine/render.mjs "$PAGE" --size "$SIZE" --stills sheet --outdir "$TMP" >/dev/null
mkdir -p "$(dirname "$OUT")"
N=$(ls "$TMP" | wc -l); ROWS=$(( (N + COLS - 1) / COLS ))
ffmpeg -hide_banner -loglevel error -y -pattern_type glob -i "$TMP/t*.jpg" -vf "scale=400:-1,drawtext=text='%{eif\:n+0.5\:d}s':x=8:y=8:fontcolor=white:fontsize=22:box=1:boxcolor=black@0.5,tile=${COLS}x${ROWS}:padding=4" -frames:v 1 -update 1 "$OUT"
rm -rf "$TMP"
echo "sheet → $OUT"
