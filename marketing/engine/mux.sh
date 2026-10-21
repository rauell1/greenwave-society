#!/bin/sh
# Mux picture + score, master to -14 LUFS / -1 dBTP (two-pass loudnorm), light film grain.
#   sh engine/mux.sh out/x.silent.mp4 out/x.wav out/x.mp4 [grain 0-10] [crf]
set -e
V=$1; A=$2; OUT=$3; GRAIN=${4:-5}; CRF=${5:-20}
M=$(ffmpeg -hide_banner -i "$A" -af loudnorm=I=-14:TP=-1:LRA=9:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$M" | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/'; }
LN="loudnorm=I=-14:TP=-1:LRA=9:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true"
VF="noise=alls=${GRAIN}:allf=t,format=yuv420p"
[ "$GRAIN" = "0" ] && VF="format=yuv420p"
ffmpeg -hide_banner -loglevel error -y -i "$V" -i "$A" -vf "$VF" -c:v libx264 -preset slow -crf "$CRF" -profile:v high -movflags +faststart \
  -af "$LN,aresample=48000" -c:a aac -b:a 192k -shortest "$OUT"
echo "master → $OUT ($(du -h "$OUT" | cut -f1))"
