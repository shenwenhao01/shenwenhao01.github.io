#!/usr/bin/env python3
"""Create web derivatives and verified content without changing research sources."""

import concurrent.futures
import hashlib
import json
import re
import shutil
import subprocess
from pathlib import Path

import fitz
import imageio_ffmpeg
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
METHODS = {"ours": "MIRROR", "unimo": "UniMo", "motiongpt3": "MotionGPT3"}
HERO = ["99", "16", "51"]
FEATURED = ["11", "100_3", "15", "99", "16", "74"]
M2T_ORDER = [
    "0_out_mesh", "27_out_mesh", "6_out_mesh", "70_out_mesh",
    "002217_mesh", "005695_mesh", "000030_mesh", "000884_mesh", "005572_mesh",
]


def source_hash(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def video_derivative(source, destination, poster):
    destination.parent.mkdir(parents=True, exist_ok=True)
    poster.parent.mkdir(parents=True, exist_ok=True)
    reader = imageio_ffmpeg.read_frames(str(source))
    info = next(reader)
    reader.close()
    if not destination.exists():
        subprocess.run([
            FFMPEG, "-nostdin", "-hide_banner", "-loglevel", "error",
            "-i", str(source), "-map_metadata", "-1",
            "-vf", "scale=-2:720", "-c:v", "libx264", "-crf", "21",
            "-preset", "medium", "-pix_fmt", "yuv420p",
            "-fps_mode", "passthrough", "-movflags", "+faststart",
            str(destination),
        ], check=True)
    if not poster.exists():
        subprocess.run([
            FFMPEG, "-nostdin", "-hide_banner", "-loglevel", "error",
            "-ss", str(min(0.65, info["duration"] * 0.35)),
            "-i", str(destination), "-frames:v", "1", "-q:v", "2",
            str(poster),
        ], check=True)
    return {
        "source": str(source.relative_to(ROOT)),
        "video": str(destination.relative_to(ROOT)),
        "poster": str(poster.relative_to(ROOT)),
        "sourceSize": list(info["size"]),
        "duration": info["duration"],
        "fps": info["fps"],
        "bytes": destination.stat().st_size,
        "sha256": source_hash(source),
    }


def clean_cell(cell):
    cell = re.sub(r"\\cite\{[^}]+\}", "", cell)
    cell = re.sub(r"\\(?:mathbf|textbf|underline)\{([^{}]+)\}", r"\1", cell)
    cell = re.sub(r"\^\{\\pm\s*([^}]+)\}", r" +/- \1", cell)
    return cell.replace("$", "").replace("{", "").replace("}", "").replace("~", " ").strip()


def parse_benchmark(tex, index, task, columns):
    blocks = re.findall(r"\\begin\{tabular\}.*?\\end\{tabular\}", tex, re.S)
    rows = []
    group = "Reference"
    for line in blocks[index].splitlines():
        line = line.split("%", 1)[0].strip()
        if "\\textbf{Gen. Only}" in line:
            group = "Generation only"
        if "\\textbf{Und. Only}" in line:
            group = "Understanding only"
        if "\\textbf{Unified}" in line:
            group = "Unified"
        if "&" not in line or not line.endswith("\\\\"):
            continue
        cells = line[:-2].split("&")
        if len(cells) != len(columns) + 2:
            continue
        name = clean_cell(cells[1])
        values = [clean_cell(cell) for cell in cells[2:]]
        if not all(re.fullmatch(r"[\d.]+(?: \+/- [\d.]+)?|--", v) for v in values):
            continue
        rows.append({
            "method": {"Ours": "MIRROR", "Ours (SFT only)": "MIRROR (SFT only)"}.get(name, name),
            "group": group,
            "values": values,
        })
    assert rows and rows[-1]["method"] == "MIRROR"
    return {"id": task, "columns": columns, "rows": rows}


def main():
    paper = ROOT / "mirror_paper"
    submission = (paper / "AnonymousSubmission2027.tex").read_text()
    title = re.search(r"\\title\{([^}]+)\}", submission)[1]
    abstract = re.search(r"\\begin\{abstract\}\s*(.*?)\s*\\end\{abstract\}", submission, re.S)[1]
    method = (paper / "sec/3_method.tex").read_text()
    experiments = (paper / "sec/4_experiments.tex").read_text()
    active_experiments = "\n".join(line.split("%", 1)[0] for line in experiments.splitlines())
    baseline_latency = re.search(r"UniMo \(AR CoT\)\s*&\s*[\d.]+\s*&\s*([\d.]+)\s*&\s*[\d.]+\s*&\s*([\d.]+)", active_experiments)
    mirror_latency = re.search(r"\\textbf\{MIRROR \(latent prefill\)\}\s*&\s*N/A\s*&\s*\\textbf\{([\d.]+)\}\s*&\s*N/A\s*&\s*\\textbf\{([\d.]+)\}", active_experiments)
    prompts = {}
    for line in (ROOT / "mirror_video/t2m/prompts.txt").read_text().splitlines():
        match = re.fullmatch(r"([^.]+)\.\s+(.+)", line)
        if match:
            prompts[match[1]] = match[2]
    tasks = []
    t2m = []
    missing = []
    ordered_ids = FEATURED + [key for key in prompts if key not in FEATURED]
    for key in ordered_ids:
        source = ROOT / f"mirror_video/t2m/ours/{key}_out_mesh.mp4"
        if not source.exists():
            missing.append(f"T2M {key}: MIRROR output video is missing; excluded.")
            continue
        entry = {"id": key, "prompt": prompts[key], "methods": {}}
        t2m.append(entry)
        for slug in METHODS:
            source = ROOT / f"mirror_video/t2m/{slug}/{key}_out_mesh.mp4"
            if source.exists():
                tasks.append((source, f"t2m/{slug}/{key}", entry["methods"], slug))
    m2t = []
    for key in M2T_ORDER:
        text_source = ROOT / f"mirror_video/m2t/{key}.txt"
        predictions = {}
        current = None
        for line in text_source.read_text().splitlines():
            if line.lower() in METHODS:
                current = line.lower()
            elif line.strip() and current:
                predictions[current] = (predictions.get(current, "") + " " + line.strip()).strip()
        assert "ours" in predictions
        entry = {
            "id": key, "prediction": predictions["ours"],
            "baselines": {METHODS[k]: v for k, v in predictions.items() if k != "ours"},
            "textSource": str(text_source.relative_to(ROOT)),
        }
        m2t.append(entry)
        tasks.append((ROOT / f"mirror_video/m2t/{key}.mp4", f"m2t/{key}", entry, "media"))

    def convert(task):
        source, stem, target, key = task
        target[key] = video_derivative(
            source, ROOT / f"assets/videos/{stem}.mp4", ROOT / f"assets/posters/{stem}.jpg"
        )

    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        list(pool.map(convert, tasks))
    figure_dir = ROOT / "assets/figures"
    figure_dir.mkdir(parents=True, exist_ok=True)
    figures = {}
    for key, name in [("method", "method_v4"), ("t2m", "t2m_res_v3"), ("m2t", "m2t_res")]:
        with fitz.open(paper / f"figs/{name}.pdf") as document:
            pixmap = document[0].get_pixmap(matrix=fitz.Matrix(2.4, 2.4), alpha=False)
            image = Image.frombytes("RGB", [pixmap.width, pixmap.height], pixmap.samples)
            image.save(figure_dir / f"{key}.webp", "WEBP", quality=94)
        figures[key] = {
            "src": f"assets/figures/{key}.webp", "width": pixmap.width, "height": pixmap.height,
            "source": f"mirror_paper/figs/{name}.pdf",
        }
    fonts = ROOT / "assets/fonts"
    fonts.mkdir(parents=True, exist_ok=True)
    for source, filename in [
        (ROOT.parent / "assets/fonts/academic/inter-latin.woff2", "inter-latin.woff2"),
        (ROOT.parent / "assets/fonts/fa-solid-900.woff2", "fa-solid-900.woff2"),
    ]:
        shutil.copy2(source, fonts / filename)
    shutil.copy2(ROOT.parent / "assets/fonts/academic/Inter-OFL.txt", fonts / "Inter-OFL.txt")
    content = {
        "anonymous": True,
        "paper": {
            "title": title, "abstract": abstract,
            "authors": [], "affiliations": [], "paperUrl": None, "codeUrl": None, "bibtex": None,
        },
        "hero": HERO,
        "inference": {
            "baseline": "UniMo",
            "source": "mirror_paper/sec/4_experiments.tex, tab:inference_efficiency",
            "t2m": {"baselineSeconds": float(baseline_latency[1]), "mirrorSeconds": float(mirror_latency[1])},
            "m2t": {"baselineSeconds": float(baseline_latency[2]), "mirrorSeconds": float(mirror_latency[2])},
        },
        "t2m": t2m,
        "m2t": m2t,
        "comparisonIds": ["11", "15", "100_3", "16", "99"],
        "figures": figures,
        "benchmarks": [
            parse_benchmark(method, 0, "t2m", [
                ["R-Precision Top 1", "up"], ["R-Precision Top 2", "up"],
                ["R-Precision Top 3", "up"], ["FID", "down"], ["MM-Dist", "down"],
                ["Diversity", "target"], ["Multimodality", "up"],
            ]),
            parse_benchmark(method, 1, "m2t", [
                ["BLEU@1", "up"], ["BLEU@4", "up"], ["ROUGE-L", "up"],
                ["CIDEr", "up"], ["BERTScore", "up"],
            ]),
        ],
        "missing": missing,
    }
    (ROOT / "data").mkdir(exist_ok=True)
    (ROOT / "data/content.json").write_text(json.dumps(content, indent=2) + "\n")
    manifest = [
        "# MIRROR asset manifest", "",
        "Local anonymous preview. Public release permission has not been established.",
        "Original files are unchanged. Web videos preserve the full sequence, timestamps and frame rate;",
        "they use H.264/yuv420p at 900 x 720 with faststart, no cropping and no image filters.", "",
        "## Authoritative research sources", "",
        "| Source | Use | Status |", "| --- | --- | --- |",
        "| `mirror_paper/AnonymousSubmission2027.tex` | Exact paper title and abstract | Real MIRROR TeX; author field still contains template staff |",
        "| `mirror_paper/sec/3_method.tex` | MIR, ROR, complete T2M and M2T tables | Research source; no acceptance claim |",
        "| `mirror_paper/sec/4_experiments.tex` | HumanML3D split and evaluation protocol | Research source |",
        "| `mirror_paper/AnonymousSubmission2027.pdf` | Not used | Stale AAAI author-kit template, not the MIRROR manuscript |",
        "| `mirror_paper/CameraReady2027.tex` and `.pdf` | Not used | AAAI author-kit template, not a final MIRROR paper |",
        "| `mirror_video/t2m/prompts.txt` | Exact T2M prompts, preserving case and punctuation | Matched by explicit sample IDs |",
        "| `mirror_video/m2t/*.txt` | Exact MIRROR and baseline predictions | Parsed method labels; no sentence normalization |",
        "| `mirror_video/MIRROR_supplementary_video.mp4` | Not embedded | Individual videos provide lighter, controlled examples |",
        "", "## Figure derivatives", "",
        "| Source | Web derivative | Dimensions |", "| --- | --- | --- |",
    ]
    for figure in figures.values():
        manifest.append(f"| `{figure['source']}` | `{figure['src']}` | {figure['width']} x {figure['height']} |")
    manifest += [
        "", "## Video derivatives", "",
        "All listed assets are local-preview only. Hero IDs: " + ", ".join(HERO) + ".",
        "The generation gallery starts with six examples and can expand to all matched MIRROR results.",
        "Comparison selectors use the same sample IDs across methods; unified playback is not strict synchronization.", "",
        "| ID / method | Original | Web video / poster stem | Source size | Duration / FPS | Web bytes | Text source |",
        "| --- | --- | --- | --- | --- | --- | --- |",
    ]
    for entry in t2m:
        for slug, media in entry["methods"].items():
            manifest.append(
                f"| T2M {entry['id']} / {METHODS[slug]} | `{media['source']}` | "
                f"`{media['video']}` / `{media['poster']}` | "
                f"{media['sourceSize'][0]} x {media['sourceSize'][1]} | {media['duration']:.3f}s / {media['fps']} | "
                f"{media['bytes']} | `mirror_video/t2m/prompts.txt`, ID {entry['id']} |"
            )
    for entry in m2t:
        media = entry["media"]
        manifest.append(
            f"| M2T {entry['id']} | `{media['source']}` | `{media['video']}` / `{media['poster']}` | "
            f"{media['sourceSize'][0]} x {media['sourceSize'][1]} | {media['duration']:.3f}s / {media['fps']} | "
            f"{media['bytes']} | `{entry['textSource']}`; Ours label |"
        )
    manifest += [
        "", "## Missing items", "",
        "- Confirmed author order and affiliations; current TeX metadata is template content.",
        "- Public release authorization, official paper URL, code URL and final BibTeX.",
        "- A compiled PDF of the actual MIRROR research paper.",
    ] + ["- " + item for item in missing] + [
        "", "## Fonts", "",
        "- Inter: copied from the repository's self-hosted academic fonts; SIL Open Font License.",
        "- Font Awesome Free solid icons: copied from the repository's existing icon font; SIL Open Font License.",
        "- No generated or third-party motion results have been added.",
    ]
    (ROOT / "ASSET_MANIFEST.md").write_text("\n".join(manifest) + "\n")
    hero_bytes = sum(next(s for s in t2m if s["id"] == key)["methods"]["ours"]["bytes"] for key in HERO)
    print(f"Prepared {len(t2m)} T2M samples, {len(m2t)} M2T samples, {len(tasks)} videos; hero {hero_bytes / 1e6:.2f} MB.")


if __name__ == "__main__":
    main()
