# Chinese Name Font

- Typeface: Zhuque Fangsong Regular, v0.212, by TrionesType.
- Release: https://github.com/TrionesType/zhuque/releases/tag/v0.212
- Archive: https://github.com/TrionesType/zhuque/releases/download/v0.212/ZhuqueFangsong-v0.212.zip
- License: SIL Open Font License 1.1, retained in `ZhuqueFangsong-OFL.txt`.
- Original license: https://github.com/TrionesType/zhuque/blob/v0.212/LICENSE.txt
- Subset: U+6C88, U+6587, U+8C6A, only the three characters in the homepage name.
- The glyph outlines are unchanged; the subset is converted to WOFF2 and preserves the original font metadata, authors, and license notice.

Rebuild with FontTools and its WOFF dependencies installed:

```sh
pyftsubset ZhuqueFangsong-Regular.ttf \
  --unicodes=U+6C88,U+6587,U+8C6A \
  --flavor=woff2 --name-IDs='*' --name-languages='*' \
  --output-file=assets/fonts/academic/zhuque-fangsong-name.woff2
```

If the displayed name changes, regenerate the subset and update the CSS `unicode-range`.
