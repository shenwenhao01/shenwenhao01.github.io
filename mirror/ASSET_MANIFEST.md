# MIRROR asset manifest

The published page uses the author list supplied by Wenhao Shen.
Original files are unchanged. Web videos preserve the full sequence, timestamps and frame rate;
they use H.264/yuv420p at 900 x 720 with faststart, no cropping and no image filters.

## Authoritative research sources

| Source | Use | Status |
| --- | --- | --- |
| `mirror_paper/AnonymousSubmission2027.tex` | Exact paper title and abstract | Real MIRROR TeX; author field still contains template staff |
| `mirror_paper/sec/3_method.tex` | MIR, ROR, complete T2M and M2T tables | Research source; no acceptance claim |
| `mirror_paper/sec/4_experiments.tex` | HumanML3D split and evaluation protocol | Research source |
| `mirror_paper/AnonymousSubmission2027.pdf` | Not used | Stale AAAI author-kit template, not the MIRROR manuscript |
| `mirror_paper/CameraReady2027.tex` and `.pdf` | Not used | AAAI author-kit template, not a final MIRROR paper |
| `mirror_video/t2m/prompts.txt` | Exact T2M prompts, preserving case and punctuation | Matched by explicit sample IDs |
| `mirror_video/m2t/*.txt` | Exact MIRROR and baseline predictions | Parsed method labels; no sentence normalization |
| `mirror_video/MIRROR_supplementary_video.mp4` | Not embedded | Individual videos provide lighter, controlled examples |

## Figure derivatives

| Source | Web derivative | Dimensions |
| --- | --- | --- |
| `mirror_paper/figs/method_v4.pdf` | `assets/figures/method.webp` | 2653 x 1469 |
| `mirror_paper/figs/t2m_res_v3.pdf` | `assets/figures/t2m.webp` | 3538 x 1701 |
| `mirror_paper/figs/m2t_res.pdf` | `assets/figures/m2t.webp` | 2041 x 1735 |

## Video derivatives

The page uses 26 MIRROR generation clips, nine motion understanding clips and five comparison groups (IDs 11, 15, 100_3, 16 and 99).
These reference 45 distinct web videos and their 45 posters. Unused baseline derivatives and their data mappings were removed with author approval; original research videos remain in the local source archive.
The old hero selection is no longer displayed. Galleries scroll horizontally; comparison controls do not imply strict synchronization.

| ID / method | Original | Web video / poster stem | Source size | Duration / FPS | Web bytes | Text source |
| --- | --- | --- | --- | --- | --- | --- |
| T2M 11 / MotionGPT3 | `mirror_video/t2m/motiongpt3/11_out_mesh.mp4` | `assets/videos/t2m/motiongpt3/11.mp4` / `assets/posters/t2m/motiongpt3/11.jpg` | 1280 x 1024 | 2.700s / 30.0 | 110164 | `mirror_video/t2m/prompts.txt`, ID 11 |
| T2M 11 / UniMo | `mirror_video/t2m/unimo/11_out_mesh.mp4` | `assets/videos/t2m/unimo/11.mp4` / `assets/posters/t2m/unimo/11.jpg` | 1280 x 1024 | 6.400s / 30.0 | 289955 | `mirror_video/t2m/prompts.txt`, ID 11 |
| T2M 11 / MIRROR | `mirror_video/t2m/ours/11_out_mesh.mp4` | `assets/videos/t2m/ours/11.mp4` / `assets/posters/t2m/ours/11.jpg` | 1280 x 1024 | 2.300s / 30.0 | 109492 | `mirror_video/t2m/prompts.txt`, ID 11 |
| T2M 100_3 / MIRROR | `mirror_video/t2m/ours/100_3_out_mesh.mp4` | `assets/videos/t2m/ours/100_3.mp4` / `assets/posters/t2m/ours/100_3.jpg` | 1280 x 1024 | 2.380s / 29.88 | 109611 | `mirror_video/t2m/prompts.txt`, ID 100_3 |
| T2M 100_3 / UniMo | `mirror_video/t2m/unimo/100_3_out_mesh.mp4` | `assets/videos/t2m/unimo/100_3.mp4` / `assets/posters/t2m/unimo/100_3.jpg` | 1280 x 1024 | 6.400s / 30.0 | 220630 | `mirror_video/t2m/prompts.txt`, ID 100_3 |
| T2M 100_3 / MotionGPT3 | `mirror_video/t2m/motiongpt3/100_3_out_mesh.mp4` | `assets/videos/t2m/motiongpt3/100_3.mp4` / `assets/posters/t2m/motiongpt3/100_3.jpg` | 1280 x 1024 | 2.930s / 30.0 | 122115 | `mirror_video/t2m/prompts.txt`, ID 100_3 |
| T2M 15 / MIRROR | `mirror_video/t2m/ours/15_out_mesh.mp4` | `assets/videos/t2m/ours/15.mp4` / `assets/posters/t2m/ours/15.jpg` | 1280 x 1024 | 3.200s / 30.0 | 130267 | `mirror_video/t2m/prompts.txt`, ID 15 |
| T2M 15 / MotionGPT3 | `mirror_video/t2m/motiongpt3/15_out_mesh.mp4` | `assets/videos/t2m/motiongpt3/15.mp4` / `assets/posters/t2m/motiongpt3/15.jpg` | 1280 x 1024 | 3.200s / 30.0 | 127667 | `mirror_video/t2m/prompts.txt`, ID 15 |
| T2M 15 / UniMo | `mirror_video/t2m/unimo/15_out_mesh.mp4` | `assets/videos/t2m/unimo/15.mp4` / `assets/posters/t2m/unimo/15.jpg` | 1280 x 1024 | 3.880s / 29.58 | 111614 | `mirror_video/t2m/prompts.txt`, ID 15 |
| T2M 99 / MIRROR | `mirror_video/t2m/ours/99_out_mesh.mp4` | `assets/videos/t2m/ours/99.mp4` / `assets/posters/t2m/ours/99.jpg` | 1280 x 1024 | 2.300s / 30.0 | 152320 | `mirror_video/t2m/prompts.txt`, ID 99 |
| T2M 99 / UniMo | `mirror_video/t2m/unimo/99_out_mesh.mp4` | `assets/videos/t2m/unimo/99.mp4` / `assets/posters/t2m/unimo/99.jpg` | 1280 x 1024 | 6.400s / 30.0 | 271797 | `mirror_video/t2m/prompts.txt`, ID 99 |
| T2M 99 / MotionGPT3 | `mirror_video/t2m/motiongpt3/99_out_mesh.mp4` | `assets/videos/t2m/motiongpt3/99.mp4` / `assets/posters/t2m/motiongpt3/99.jpg` | 1280 x 1024 | 2.930s / 30.0 | 150738 | `mirror_video/t2m/prompts.txt`, ID 99 |
| T2M 16 / MIRROR | `mirror_video/t2m/ours/16_out_mesh.mp4` | `assets/videos/t2m/ours/16.mp4` / `assets/posters/t2m/ours/16.jpg` | 1280 x 1024 | 4.000s / 30.0 | 182806 | `mirror_video/t2m/prompts.txt`, ID 16 |
| T2M 16 / UniMo | `mirror_video/t2m/unimo/16_out_mesh.mp4` | `assets/videos/t2m/unimo/16.mp4` / `assets/posters/t2m/unimo/16.jpg` | 1280 x 1024 | 2.930s / 30.0 | 123846 | `mirror_video/t2m/prompts.txt`, ID 16 |
| T2M 16 / MotionGPT3 | `mirror_video/t2m/motiongpt3/16_out_mesh.mp4` | `assets/videos/t2m/motiongpt3/16.mp4` / `assets/posters/t2m/motiongpt3/16.jpg` | 1280 x 1024 | 2.930s / 30.0 | 125289 | `mirror_video/t2m/prompts.txt`, ID 16 |
| T2M 74 / MIRROR | `mirror_video/t2m/ours/74_out_mesh.mp4` | `assets/videos/t2m/ours/74.mp4` / `assets/posters/t2m/ours/74.jpg` | 1280 x 1024 | 3.200s / 30.0 | 169298 | `mirror_video/t2m/prompts.txt`, ID 74 |
| T2M 3 / MIRROR | `mirror_video/t2m/ours/3_out_mesh.mp4` | `assets/videos/t2m/ours/3.mp4` / `assets/posters/t2m/ours/3.jpg` | 1280 x 1024 | 3.070s / 30.0 | 149969 | `mirror_video/t2m/prompts.txt`, ID 3 |
| T2M 19 / MIRROR | `mirror_video/t2m/ours/19_out_mesh.mp4` | `assets/videos/t2m/ours/19.mp4` / `assets/posters/t2m/ours/19.jpg` | 1280 x 1024 | 5.600s / 30.0 | 241582 | `mirror_video/t2m/prompts.txt`, ID 19 |
| T2M 21 / MIRROR | `mirror_video/t2m/ours/21_out_mesh.mp4` | `assets/videos/t2m/ours/21.mp4` / `assets/posters/t2m/ours/21.jpg` | 1280 x 1024 | 5.730s / 30.0 | 176264 | `mirror_video/t2m/prompts.txt`, ID 21 |
| T2M 38 / MIRROR | `mirror_video/t2m/ours/38_out_mesh.mp4` | `assets/videos/t2m/ours/38.mp4` / `assets/posters/t2m/ours/38.jpg` | 1280 x 1024 | 2.430s / 30.0 | 109764 | `mirror_video/t2m/prompts.txt`, ID 38 |
| T2M 2 / MIRROR | `mirror_video/t2m/ours/2_out_mesh.mp4` | `assets/videos/t2m/ours/2.mp4` / `assets/posters/t2m/ours/2.jpg` | 1280 x 1024 | 2.300s / 30.0 | 123674 | `mirror_video/t2m/prompts.txt`, ID 2 |
| T2M 5 / MIRROR | `mirror_video/t2m/ours/5_out_mesh.mp4` | `assets/videos/t2m/ours/5.mp4` / `assets/posters/t2m/ours/5.jpg` | 1280 x 1024 | 2.570s / 30.0 | 82171 | `mirror_video/t2m/prompts.txt`, ID 5 |
| T2M 10 / MIRROR | `mirror_video/t2m/ours/10_out_mesh.mp4` | `assets/videos/t2m/ours/10.mp4` / `assets/posters/t2m/ours/10.jpg` | 1280 x 1024 | 2.430s / 30.0 | 122585 | `mirror_video/t2m/prompts.txt`, ID 10 |
| T2M 14 / MIRROR | `mirror_video/t2m/ours/14_out_mesh.mp4` | `assets/videos/t2m/ours/14.mp4` / `assets/posters/t2m/ours/14.jpg` | 1280 x 1024 | 2.170s / 30.0 | 119242 | `mirror_video/t2m/prompts.txt`, ID 14 |
| T2M 100_15 / MIRROR | `mirror_video/t2m/ours/100_15_out_mesh.mp4` | `assets/videos/t2m/ours/100_15.mp4` / `assets/posters/t2m/ours/100_15.jpg` | 1280 x 1024 | 2.700s / 30.0 | 115452 | `mirror_video/t2m/prompts.txt`, ID 100_15 |
| T2M 18 / MIRROR | `mirror_video/t2m/ours/18_out_mesh.mp4` | `assets/videos/t2m/ours/18.mp4` / `assets/posters/t2m/ours/18.jpg` | 1280 x 1024 | 3.200s / 30.0 | 172170 | `mirror_video/t2m/prompts.txt`, ID 18 |
| T2M 23 / MIRROR | `mirror_video/t2m/ours/23_out_mesh.mp4` | `assets/videos/t2m/ours/23.mp4` / `assets/posters/t2m/ours/23.jpg` | 1280 x 1024 | 3.200s / 30.0 | 164574 | `mirror_video/t2m/prompts.txt`, ID 23 |
| T2M 44 / MIRROR | `mirror_video/t2m/ours/44_out_mesh.mp4` | `assets/videos/t2m/ours/44.mp4` / `assets/posters/t2m/ours/44.jpg` | 1280 x 1024 | 4.000s / 30.0 | 177829 | `mirror_video/t2m/prompts.txt`, ID 44 |
| T2M 47 / MIRROR | `mirror_video/t2m/ours/47_out_mesh.mp4` | `assets/videos/t2m/ours/47.mp4` / `assets/posters/t2m/ours/47.jpg` | 1280 x 1024 | 2.570s / 30.0 | 95841 | `mirror_video/t2m/prompts.txt`, ID 47 |
| T2M 48 / MIRROR | `mirror_video/t2m/ours/48_out_mesh.mp4` | `assets/videos/t2m/ours/48.mp4` / `assets/posters/t2m/ours/48.jpg` | 1280 x 1024 | 2.170s / 30.0 | 151897 | `mirror_video/t2m/prompts.txt`, ID 48 |
| T2M 49 / MIRROR | `mirror_video/t2m/ours/49_out_mesh.mp4` | `assets/videos/t2m/ours/49.mp4` / `assets/posters/t2m/ours/49.jpg` | 1280 x 1024 | 2.300s / 30.0 | 148246 | `mirror_video/t2m/prompts.txt`, ID 49 |
| T2M 51 / MIRROR | `mirror_video/t2m/ours/51_out_mesh.mp4` | `assets/videos/t2m/ours/51.mp4` / `assets/posters/t2m/ours/51.jpg` | 1280 x 1024 | 2.300s / 30.0 | 72451 | `mirror_video/t2m/prompts.txt`, ID 51 |
| T2M 53 / MIRROR | `mirror_video/t2m/ours/53_out_mesh.mp4` | `assets/videos/t2m/ours/53.mp4` / `assets/posters/t2m/ours/53.jpg` | 1280 x 1024 | 3.070s / 30.0 | 244871 | `mirror_video/t2m/prompts.txt`, ID 53 |
| T2M 67 / MIRROR | `mirror_video/t2m/ours/67_out_mesh.mp4` | `assets/videos/t2m/ours/67.mp4` / `assets/posters/t2m/ours/67.jpg` | 1280 x 1024 | 3.200s / 30.0 | 147128 | `mirror_video/t2m/prompts.txt`, ID 67 |
| T2M 71 / MIRROR | `mirror_video/t2m/ours/71_out_mesh.mp4` | `assets/videos/t2m/ours/71.mp4` / `assets/posters/t2m/ours/71.jpg` | 1280 x 1024 | 3.200s / 30.0 | 188963 | `mirror_video/t2m/prompts.txt`, ID 71 |
| T2M 77 / MIRROR | `mirror_video/t2m/ours/77_out_mesh.mp4` | `assets/videos/t2m/ours/77.mp4` / `assets/posters/t2m/ours/77.jpg` | 1280 x 1024 | 3.600s / 30.0 | 122402 | `mirror_video/t2m/prompts.txt`, ID 77 |
| M2T 0_out_mesh | `mirror_video/m2t/0_out_mesh.mp4` | `assets/videos/m2t/0_out_mesh.mp4` / `assets/posters/m2t/0_out_mesh.jpg` | 1280 x 1024 | 2.030s / 30.0 | 100202 | `mirror_video/m2t/0_out_mesh.txt`; Ours label |
| M2T 27_out_mesh | `mirror_video/m2t/27_out_mesh.mp4` | `assets/videos/m2t/27_out_mesh.mp4` / `assets/posters/m2t/27_out_mesh.jpg` | 1280 x 1024 | 3.200s / 30.0 | 162350 | `mirror_video/m2t/27_out_mesh.txt`; Ours label |
| M2T 6_out_mesh | `mirror_video/m2t/6_out_mesh.mp4` | `assets/videos/m2t/6_out_mesh.mp4` / `assets/posters/m2t/6_out_mesh.jpg` | 1280 x 1024 | 2.030s / 30.0 | 94917 | `mirror_video/m2t/6_out_mesh.txt`; Ours label |
| M2T 70_out_mesh | `mirror_video/m2t/70_out_mesh.mp4` | `assets/videos/m2t/70_out_mesh.mp4` / `assets/posters/m2t/70_out_mesh.jpg` | 1280 x 1024 | 2.430s / 30.0 | 136475 | `mirror_video/m2t/70_out_mesh.txt`; Ours label |
| M2T 002217_mesh | `mirror_video/m2t/002217_mesh.mp4` | `assets/videos/m2t/002217_mesh.mp4` / `assets/posters/m2t/002217_mesh.jpg` | 1280 x 1024 | 6.630s / 30.0 | 385678 | `mirror_video/m2t/002217_mesh.txt`; Ours label |
| M2T 005695_mesh | `mirror_video/m2t/005695_mesh.mp4` | `assets/videos/m2t/005695_mesh.mp4` / `assets/posters/m2t/005695_mesh.jpg` | 1280 x 1024 | 6.630s / 30.0 | 284471 | `mirror_video/m2t/005695_mesh.txt`; Ours label |
| M2T 000030_mesh | `mirror_video/m2t/000030_mesh.mp4` | `assets/videos/m2t/000030_mesh.mp4` / `assets/posters/m2t/000030_mesh.jpg` | 1280 x 1024 | 2.270s / 30.0 | 90085 | `mirror_video/m2t/000030_mesh.txt`; Ours label |
| M2T 000884_mesh | `mirror_video/m2t/000884_mesh.mp4` | `assets/videos/m2t/000884_mesh.mp4` / `assets/posters/m2t/000884_mesh.jpg` | 1280 x 1024 | 6.630s / 30.0 | 372818 | `mirror_video/m2t/000884_mesh.txt`; Ours label |
| M2T 005572_mesh | `mirror_video/m2t/005572_mesh.mp4` | `assets/videos/m2t/005572_mesh.mp4` / `assets/posters/m2t/005572_mesh.jpg` | 1280 x 1024 | 4.370s / 30.0 | 124804 | `mirror_video/m2t/005572_mesh.txt`; Ours label |

## Missing items

- Official paper URL, code URL and final BibTeX are not supplied.
- Author order and affiliations come from the user; template TeX author blocks are not used.
- A compiled PDF of the actual MIRROR research paper.
- T2M 0: MIRROR output video is missing; excluded.

## Fonts

- Inter: copied from the repository's self-hosted academic fonts; SIL Open Font License.
- Font Awesome Free solid icons: copied from the repository's existing icon font; SIL Open Font License.
- No generated or third-party motion results have been added.
