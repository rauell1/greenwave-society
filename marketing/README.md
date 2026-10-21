# Greenwave marketing kit

Films, social stills, print and a responsive media kit for Greenwave Society. Everything is
drawn in code from the website's own brand (colours from `src/app/globals.css`, Playfair
Display and Plus Jakarta Sans, the half-globe emblem), so nothing here depends on stock
footage or generated imagery, and every piece can be re-rendered at any size.

## What's inside

| Piece | Length | Formats | Source |
|---|---|---|---|
| **The Wave**: brand anthem | 30 s | 16:9, 4:5, 1:1, 9:16 | `films/anthem/` |
| **Six Ways In**: programme reel | 20 s | 16:9, 4:5, 1:1, 9:16 | `films/programmes/` |
| **Bumper**: sign-off | 6 s | 16:9, 4:5, 1:1, 9:16 | cut from the anthem |
| Programme carousel | 6 slides | 4:5 | frames of the programme reel |
| Impact post, join post/story | | 1:1, 4:5, 9:16 | `stills/` |
| Link preview, X and LinkedIn banners | | 1200×630, 1500×500, 1584×396 | `stills/` |
| A4 poster | | JPG + 300 dpi PDF | `stills/` |
| Media kit page | | any screen | `kit/index.html` |

Rendered files land in `out/` (masters in `out/films/`, stills in `out/stills/`) and the
720p web cuts and stills the media kit shows in `kit/media/`. Both folders are
git-ignored: run `sh build.sh` to produce them.

## How it scales to every device

Each film is one web page with a `render(t)` function that lays itself out from the frame
size it is given: landscape, square and portrait each get their own composition (text
column beside the action on 16:9, stacked above it on 9:16, emblem and wordmark re-staged
for the lockup), not a crop of one master. The renderer captures the same page at
1920×1080, 1080×1350, 1080×1080 and 1080×1920.

The media kit then picks the right cut for the viewer: an upright phone gets 9:16, an
upright tablet 4:5, a near-square window 1:1 and anything wider 16:9. It swaps the cut
on resize or rotation and keeps the playback position.

To use the same rule on the website, serve the four web cuts and pick with the
aspect-ratio thresholds in `kit/index.html` (`bestFor`), or with CSS media queries such as
`(max-aspect-ratio: 2/3)` → 9:16.

## Build

Needs Node 20+, Python 3 with numpy, ffmpeg with libx264, and Chromium
(set `GW_CHROME` if it is not at the Playwright default path).

```sh
cd marketing
npm install
sh build.sh            # all films, cuts, stills and contact sheets → out/
```

Useful pieces on their own:

```sh
node engine/serve.mjs                                   # live preview at http://127.0.0.1:4173/films/anthem/
node engine/render.mjs films/anthem --size 1080x1920 --out out/anthem-9x16.silent.mp4
node engine/render.mjs stills --size 1080x1080 --query tpl=impact --still out/impact.jpg
sh engine/sheet.sh films/anthem 1080x1920 out/sheets/anthem-9x16.jpg 10
```

Opening a film page in a browser without `?w=&h=` plays it live, fitted to the window.

## How the pipeline works

1. **Picture.** `films/*/index.html` draw each frame on a canvas as a pure function of time
   (`engine/brand.js` holds the palette, fonts, emblem, people, acacias, skyline, wave wipe).
2. **Capture.** `engine/render.mjs` opens the page in headless Chromium, screenshots every
   frame across four workers and encodes with ffmpeg.
3. **Sound.** The page exports its cues (`--events`). `engine/audio.py` scores the film
   from those cues with synthesised kalimba, marimba, shaker, bass and effects, so every
   sound lands on its frame.
4. **Master.** `engine/mux.sh` muxes, adds light grain and runs two-pass loudness
   normalisation to −14 LUFS, −1 dBTP.

## Facts used

The figures come from `IMPACT_STATS` in `src/config/app.config.ts` (500 youth reached,
10,000 trees planted, 25 communities served, 50 events). Programme names and descriptions
come from `src/components/sections/Programs.tsx`. Update those numbers there and in
`films/anthem/index.html` and `stills/index.html` together, then rebuild.

See `TREATMENT.md` for the creative plan and `CREDITS` for third-party assets.
