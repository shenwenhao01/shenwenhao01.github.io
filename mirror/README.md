# MIRROR project page

Static HTML, CSS and JavaScript for MIRROR, using the supplied motion videos,
verified predictions, paper figures and benchmark data. No frontend framework,
backend, remote font service or model inference is required.

## Preview and edit

From the repository root:

```sh
node mirror/scripts/serve.mjs 8000
```

Open `http://127.0.0.1:8000/mirror/`. This development server supports video byte
ranges and serves only page files and web assets. Its `X-Robots-Tag: noindex,
nofollow` header applies only to local preview, not the published HTML.

- Edit `styles.css` for presentation and `main.js` for interaction.
- Edit `scripts/index.template.html` for page structure.
- Edit `data/content.json` for metadata, exact prompts/predictions, sample mappings,
  benchmark values and inference timings.
- After template or data edits, run `node mirror/scripts/render.mjs` to update
  `index.html`. Commit both the source and generated HTML.

The HTML contains 26 text-to-motion examples, nine motion-to-text examples, five
three-model comparison groups, both full benchmark tables, authors and figures.
JavaScript adds centered scrolling galleries, table tabs, video playback and
image dialogs. Without JavaScript, examples, text, tables, image links and direct
video links remain available. Abstract and paper figures use native disclosures.

## Playback

Desktop galleries automatically play only visible, active examples. Manual
pauses persist while scrolling. Switching slides, leaving the viewport or hiding
the tab pauses the affected media.

Mobile, reduced-motion and data-saving settings default to manual playback.
On mobile, one example plays at a time; a comparison group is one viewing unit
and its three clips can play together using Play all / Pause all / Replay.
The clips can have different durations, so the page does not claim strict
synchronization. Playback errors retain an Open video fallback.

## Publication

The user-supplied seven authors and three affiliations are configured with
`anonymous: false`. Paper/code URLs and BibTeX remain unset and their controls
stay hidden. No conference acceptance is inferred. The supplied manuscript PDFs
are AAAI author-kit templates, not the final MIRROR paper.

The root `.gitignore` allows the static page, assets, data, maintenance scripts
and documentation. Original research directories, review screenshots and the
internal design guide stay local. `_config.yml` excludes those directories plus
maintenance scripts/documentation from Jekyll output. Publishing requires only:

- `index.html`, `styles.css`, `main.js`
- `data/content.json`
- `assets/`, including font licenses

GitHub Pages can serve the page at `/mirror/`. The committed generated HTML needs
no Node build during deployment. Relative paths support project subdirectories.
Neither removing `noindex` nor building locally commits or publishes anything.

## Source assets and reproducibility

`mirror_paper/` and `mirror_video/` are local source archives. Keep them outside
public commits; they are not required to serve the website. `ASSET_MANIFEST.md`
records source/derivative mappings, dimensions, durations, hashes and omissions.

The existing web videos are H.264/yuv420p, 900 × 720, with faststart. They preserve
source timing, complete framing and frame rates. Preparation uses PyMuPDF,
Pillow and imageio-ffmpeg, with no such dependencies needed by the website.

Do not run `scripts/prepare_assets.py` for ordinary page edits. It re-extracts
research data and replaces `data/content.json`, resetting authors to anonymous
metadata. Back up the current JSON and manifest, then explicitly reapply approved
metadata and sample selection if rebuilding derivatives. It also regenerates
older descriptive sections of the manifest; review those after regeneration.

To add a sample, keep an exact prompt or prediction and matching media ID, create
web video/poster derivatives, add their paths to the JSON, and regenerate HTML.
The current comparison groups use IDs 11, 15, 100_3, 16 and 99. T2M ID 0 is absent
because its MIRROR output was not supplied.

## Checks on November 25, 2026

Chrome checks passed for 1440, 1024, 768, 390 and 320 px widths, consistent section
and disclosure headings, internal table scrolling, desktop/mobile/reduced-motion
playback, manual pause persistence, all three carousel controls and wraparound,
comparison playback, table keyboard navigation, disclosures, image dialogs,
no-JavaScript access and failed video/JSON fallback. All 26/9/5 sample mappings
match the configured data; all referenced assets and in-page anchors exist.
All 87 original video SHA-256 values match the recorded source hashes.

Generated `index.html` matches its template/data. Syntax checks pass for all
JavaScript files. The release audit and cleanup record live in `review/`
and are excluded from Git and publication. With author approval, 42 unused
baseline videos and their posters were removed, along with their JSON mappings.
The published assets contain only the 45 referenced videos and matching posters.
Local preview artifacts, supplementary-video build intermediates and the duplicate
supplementary-video ZIP were removed; original videos and the standalone
supplementary MP4 are retained locally.
