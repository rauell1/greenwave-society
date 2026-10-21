#!/bin/sh
# One command builds every film, cut-down, still and poster into out/.
#   cd marketing && npm install && sh build.sh
set -e
cd "$(dirname "$0")"
R="node engine/render.mjs"
mkdir -p out/films out/stills out/sheets kit/media

# ---- films: one source, every screen shape ----
for FILM in anthem programmes; do
  $R films/$FILM --events out/$FILM.events.json
  python3 engine/audio.py out/$FILM.events.json $FILM out/$FILM.wav
  for S in 1920x1080:16x9 1080x1920:9x16 1080x1080:1x1 1080x1350:4x5; do
    SIZE=${S%%:*}; TAG=${S##*:}
    $R films/$FILM --size $SIZE --fps 30 --out out/$FILM-$TAG.silent.mp4
    sh engine/mux.sh out/$FILM-$TAG.silent.mp4 out/$FILM.wav out/films/greenwave-$FILM-$TAG.mp4 4 21
    rm out/$FILM-$TAG.silent.mp4
  done
done
# 6-second bumper cut from the anthem's ending
for TAG in 16x9 9x16 1x1 4x5; do
  ffmpeg -hide_banner -loglevel error -y -ss 24.0 -i out/films/greenwave-anthem-$TAG.mp4 -t 6 -af "afade=t=in:d=0.3,afade=t=out:st=5.2:d=0.8" \
    -c:v libx264 -crf 21 -preset slow -movflags +faststart -c:a aac -b:a 160k out/films/greenwave-bumper-$TAG.mp4
done
# 720p web versions for the media kit
for F in out/films/greenwave-*.mp4; do
  B=$(basename "$F" .mp4)
  ffmpeg -hide_banner -loglevel error -y -i "$F" -vf "scale='if(gt(iw,ih),1280,-2)':'if(gt(iw,ih),-2,1280)'" -c:v libx264 -crf 25 -preset slow -movflags +faststart -c:a aac -b:a 128k "kit/media/$B-web.mp4" 2>/dev/null || true
done

# ---- posters for each film (first frame for players) ----
for S in 1920x1080:16x9 1080x1920:9x16 1080x1080:1x1 1080x1350:4x5; do
  SIZE=${S%%:*}; TAG=${S##*:}
  $R films/anthem --size $SIZE --still out/stills/anthem-poster-$TAG.jpg --t 28.5
  $R films/programmes --size $SIZE --still out/stills/programmes-poster-$TAG.jpg --t 1.9
done
# programme carousel: one slide per programme, 4:5
for I in 0 1 2 3 4 5; do
  $R films/programmes --size 1080x1350 --still out/stills/programme-$((I+1))-4x5.jpg --t $(python3 -c "print(2.5*($I+1)+2.3)")
done

# ---- static stills ----
$R stills --size 1080x1080 --query tpl=impact --still out/stills/impact-1x1.jpg
$R stills --size 1080x1350 --query tpl=impact --still out/stills/impact-4x5.jpg
$R stills --size 1080x1920 --query tpl=join --still out/stills/join-story-9x16.jpg
$R stills --size 1080x1080 --query tpl=join --still out/stills/join-1x1.jpg
$R stills --size 1200x630 --query tpl=og --still out/stills/og-1200x630.jpg
$R stills --size 1500x500 --query tpl=banner --still out/stills/banner-x-1500x500.jpg
$R stills --size 1584x396 --query tpl=banner --still out/stills/banner-linkedin-1584x396.jpg
$R stills --size 1240x1754 --query tpl=poster --still out/stills/poster-a4.jpg
$R stills --size 2480x3508 --query tpl=poster --still out/stills/poster-a4-print.pdf

cp out/stills/*.jpg kit/media/

# ---- contact sheets for review ----
sh engine/sheet.sh films/anthem 1920x1080 out/sheets/anthem-16x9.jpg
sh engine/sheet.sh films/programmes 1920x1080 out/sheets/programmes-16x9.jpg 5
echo "build complete → out/"
