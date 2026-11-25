# Wenhao's Homepage

An academic homepage built with Jekyll for GitHub Pages.

## Updating Content

- `_pages/about.md`: biography and selected publications.
- `_includes/experience.html`: compact homepage experience, education, and academic service. The old `/experience/` URL redirects to `/#experience`.
- `_data/publications.yml`: the shared publication list. Set `selected: true` to feature a paper on the homepage.
- `_data/projects.yml`: the gallery at `/projects/`. Add an entry with a unique `id`, `title`, `description`, project-page `url`, `image`, and `image_alt`; optionally include `video`, `venue`, `year`, `paper`, or `code`. Local project URLs start with `/`; external URLs use their full address. Entries appear in file order, in two columns on desktop and one on mobile.
- `_includes/research-preview.html`: shared image/video previews for publications and projects.
- `images/publications/`: locally hosted research figures. `image_source` records where each figure came from. Entries without an image use a document placeholder.
- `_sass/_academic.scss`: responsive layout and styling.
- `assets/fonts/academic/`: self-hosted Newsreader (headings and prose) and Inter (metadata), with their OFL licenses.
- `images/organizations/`: locally stored company logos and university crests. ByteDance uses its symbol without the wordmark. Source URLs are recorded in `SOURCES.md`.

All 12 current publications have images. The Flying Camera, HMR-Adapter, and Human Interactions thumbnails are cropped directly from Figure 1 of their original manuscripts; source URLs and crop notes are stored alongside each publication.

Publication entries use `id`, `title`, `authors`, `venue`, `year`, and `type` (`published` or `preprint`), with optional `paper`, `code`, `project`, `image`, `image_alt`, and `note` fields. Keep IDs unique and list newer work first. Years describe the venue year or original preprint year.

For animated previews, add a local MP4 path in `video` and record its original URL in `video_source`. Keep `image` as the static fallback. DanceHMR uses a 12-second fast-start excerpt of its original project video (the full video is unchanged); Human Interactions uses the video provided by Qing Shuai. Videos load and play muted only when visible, pause offscreen or in a hidden tab, and have a play/pause control. Reduced-motion and data-saving preferences disable automatic playback. With JavaScript disabled or a video load failure, the figure remains visible.

Old blog sources in `_posts`, `_drafts`, and `_pages/year-archive.html` are preserved but excluded from the site build in `_config.yml`. They do not appear in navigation, published pages, the sitemap, or feed entries.

## Local Preview

With a compatible Ruby and Bundler installed:

```sh
bundle install
bundle exec jekyll serve --config _config.yml,_config.dev.yml
```

Open `http://localhost:4000`. GitHub Pages builds from source; generated `_site` output should not be committed.
