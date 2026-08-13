#!/usr/bin/env python3
"""Batch sticker asset preparation.

The pipeline accepts generated sticker sheets or individual raster files and
produces padded RGBA PNGs, a semantic CSV index, and a machine-readable QA
report. It intentionally has no dependency beyond Pillow.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import re
import shutil
import sys
from collections import deque
from pathlib import Path
from typing import Any, Iterable

from PIL import Image, ImageFilter


DEFAULT_TOLERANCE = 28
DEFAULT_MIN_LUMA = 218
DEFAULT_NEUTRAL = 32
DEFAULT_OUTLINE = 3
DEFAULT_PADDING = 10


def slugify(value: str) -> str:
    value = re.sub(r"[^A-Za-z0-9]+", "_", value.strip()).strip("_")
    return value.upper() or "ASSET"


def color_distance(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    return math.sqrt(sum((int(x) - int(y)) ** 2 for x, y in zip(a, b)))


def luminance(pixel: tuple[int, int, int]) -> float:
    r, g, b = pixel
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def is_neutral_light(pixel: tuple[int, int, int], min_luma: int, neutral: int) -> bool:
    return luminance(pixel) >= min_luma and max(pixel) - min(pixel) <= neutral


def border_pixels(rgb: Image.Image) -> list[tuple[int, int, int]]:
    width, height = rgb.size
    band_x = max(2, width // 80)
    band_y = max(2, height // 80)
    pixels = rgb.load()
    result: list[tuple[int, int, int]] = []
    for y in range(min(band_y, height)):
        for x in range(width):
            result.append(pixels[x, y])
            result.append(pixels[x, height - 1 - y])
    for x in range(min(band_x, width)):
        for y in range(height):
            result.append(pixels[x, y])
            result.append(pixels[width - 1 - x, y])
    return result


def estimate_background_colors(rgb: Image.Image, min_luma: int, neutral: int) -> list[tuple[int, int, int]]:
    """Estimate the two light neutral colors used by common checkerboards."""
    candidates = [p for p in border_pixels(rgb) if is_neutral_light(p, min_luma, neutral)]
    if not candidates:
        w, h = rgb.size
        pixels = rgb.load()
        candidates = [pixels[0, 0], pixels[w - 1, 0], pixels[0, h - 1], pixels[w - 1, h - 1]]
    buckets: dict[tuple[int, int, int], int] = {}
    for r, g, b in candidates:
        bucket = (round(r / 8) * 8, round(g / 8) * 8, round(b / 8) * 8)
        buckets[bucket] = buckets.get(bucket, 0) + 1
    ranked = sorted(buckets.items(), key=lambda item: item[1], reverse=True)
    colors = [color for color, _ in ranked[:4]]
    if not colors:
        colors = [(255, 255, 255)]
    return colors


def checkerboard_background_mask(
    rgb: Image.Image,
    tolerance: int = DEFAULT_TOLERANCE,
    min_luma: int = DEFAULT_MIN_LUMA,
    neutral: int = DEFAULT_NEUTRAL,
) -> Image.Image:
    """Return an edge-connected mask for light checkerboard background pixels.

    Only edge-connected pixels are removed. This keeps white speech bubbles
    and white die-cut borders that are enclosed by the artwork contour.
    """
    width, height = rgb.size
    pixels = rgb.load()
    colors = estimate_background_colors(rgb, min_luma, neutral)
    likely = bytearray(width * height)
    for y in range(height):
        for x in range(width):
            p = pixels[x, y]
            if is_neutral_light(p, min_luma, neutral) and min(color_distance(p, c) for c in colors) <= tolerance:
                likely[y * width + x] = 1

    removed = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()
    for x in range(width):
        for y in (0, height - 1):
            i = y * width + x
            if likely[i] and not removed[i]:
                removed[i] = 1
                queue.append((x, y))
    for y in range(height):
        for x in (0, width - 1):
            i = y * width + x
            if likely[i] and not removed[i]:
                removed[i] = 1
                queue.append((x, y))

    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height:
                i = ny * width + nx
                if likely[i] and not removed[i]:
                    removed[i] = 1
                    queue.append((nx, ny))

    return Image.frombytes("L", (width, height), bytes(removed))


def dilated_mask(mask: Image.Image, radius: int) -> Image.Image:
    if radius <= 0:
        return mask
    size = radius * 2 + 1
    return mask.filter(ImageFilter.MaxFilter(size=size))


def process_image(
    input_path: Path,
    output_path: Path,
    *,
    tolerance: int = DEFAULT_TOLERANCE,
    min_luma: int = DEFAULT_MIN_LUMA,
    neutral: int = DEFAULT_NEUTRAL,
    outline: int = DEFAULT_OUTLINE,
    padding: int = DEFAULT_PADDING,
    trim: bool = True,
) -> dict[str, Any]:
    image = Image.open(input_path).convert("RGBA")
    rgb = image.convert("RGB")
    existing_alpha = image.getchannel("A")
    if existing_alpha.getextrema() != (255, 255):
        # Preserve real alpha and only remove an opaque checkerboard if it is
        # visibly present. Transparent inputs remain transparent.
        background = checkerboard_background_mask(rgb, tolerance, min_luma, neutral)
    else:
        background = checkerboard_background_mask(rgb, tolerance, min_luma, neutral)

    alpha = existing_alpha.copy()
    alpha_pixels = alpha.load()
    background_pixels = background.load()
    removed = 0
    for y in range(image.height):
        for x in range(image.width):
            if background_pixels[x, y] > 0:
                if alpha_pixels[x, y] > 0:
                    removed += 1
                alpha_pixels[x, y] = 0

    # Reconstruct a small white die-cut edge around surviving artwork. This
    # compensates for generated sheets whose white outer border touches a
    # white checkerboard square at the edge.
    core = alpha.point(lambda value: 255 if value > 12 else 0)
    outline_mask = dilated_mask(core, outline)
    out = Image.new("RGBA", image.size, (255, 255, 255, 0))
    out_pixels = out.load()
    out_rgb = rgb.load()
    outline_pixels = outline_mask.load()
    for y in range(image.height):
        for x in range(image.width):
            if outline_pixels[x, y] and alpha_pixels[x, y] == 0:
                out_pixels[x, y] = (255, 255, 255, 255)
            elif alpha_pixels[x, y] > 0:
                out_pixels[x, y] = (*out_rgb[x, y], alpha_pixels[x, y])

    if trim:
        bbox = out.getchannel("A").getbbox()
        if bbox:
            left = max(0, bbox[0] - padding)
            top = max(0, bbox[1] - padding)
            right = min(out.width, bbox[2] + padding)
            bottom = min(out.height, bbox[3] + padding)
            out = out.crop((left, top, right, bottom))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    # Atomic replace prevents a partial/zero-byte PNG from being published if
    # the process is interrupted during compression.
    temporary_output = output_path.with_name(output_path.stem + ".tmp.png")
    out.save(temporary_output, "PNG", optimize=True)
    temporary_output.replace(output_path)
    alpha_bbox = out.getchannel("A").getbbox()
    return {
        "input": str(input_path),
        "output": str(output_path),
        "width": out.width,
        "height": out.height,
        "removed_background_pixels": removed,
        "has_alpha": True,
        "alpha_bbox": list(alpha_bbox) if alpha_bbox else None,
    }


def split_sheet(args: argparse.Namespace) -> list[dict[str, Any]]:
    source = Path(args.input).resolve()
    image = Image.open(source).convert("RGB")
    cols, rows = args.cols, args.rows
    output_dir = Path(args.out).resolve()
    labels = args.labels or []
    results: list[dict[str, Any]] = []
    for index in range(rows * cols):
        row, col = divmod(index, cols)
        left = round(col * image.width / cols)
        right = round((col + 1) * image.width / cols)
        top = round(row * image.height / rows)
        bottom = round((row + 1) * image.height / rows)
        crop = image.crop((left, top, right, bottom))
        label = labels[index] if index < len(labels) else f"ASSET_{index + 1:02d}"
        filename = f"{args.prefix}-{index + 1:02d}_{slugify(label)}.png"
        temp = output_dir / ".working" / filename
        final = output_dir / filename
        temp.parent.mkdir(parents=True, exist_ok=True)
        crop.save(temp, "PNG")
        item = process_image(
            temp,
            final,
            tolerance=args.tolerance,
            min_luma=args.min_luma,
            neutral=args.neutral,
            outline=args.outline,
            padding=args.padding,
        )
        item.update({"index": index + 1, "label": label, "source_sheet": str(source), "filename": filename})
        results.append(item)
    # The temporary directory is removed by the batch builder after each
    # module; keeping it out of the published output also keeps QA deterministic.
    shutil.rmtree(output_dir / ".working", ignore_errors=True)
    return results


def read_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(value, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def validate_file(path: Path, min_size: int = 12) -> dict[str, Any]:
    result: dict[str, Any] = {"file": str(path), "status": "PASS", "issues": []}
    try:
        image = Image.open(path)
        if image.format != "PNG":
            result["issues"].append("not_png")
        if image.mode != "RGBA":
            result["issues"].append("missing_rgba")
        if image.width < min_size or image.height < min_size:
            result["issues"].append("too_small")
        alpha = image.convert("RGBA").getchannel("A")
        if alpha.getbbox() is None:
            result["issues"].append("empty_alpha")
        corners = [alpha.getpixel(p) for p in [(0, 0), (image.width - 1, 0), (0, image.height - 1), (image.width - 1, image.height - 1)]]
        result["transparent_corners"] = sum(1 for value in corners if value < 64)
        if result["transparent_corners"] < 2:
            result["issues"].append("background_may_remain")
        bbox = alpha.getbbox()
        result["size"] = [image.width, image.height]
        result["alpha_bbox"] = list(bbox) if bbox else None
    except Exception as exc:  # pragma: no cover - defensive QA report
        result["status"] = "FAIL"
        result["issues"].append(f"read_error:{exc}")
    if result["issues"]:
        result["status"] = "FAIL"
    return result


def validate_dir(directory: Path) -> dict[str, Any]:
    files = sorted(
        path for path in directory.rglob("*.png")
        if not any(part.startswith(".") for part in path.relative_to(directory).parts)
        and not path.name.endswith(".tmp.png")
    )
    results = [validate_file(path) for path in files]
    return {
        "directory": str(directory),
        "files": len(results),
        "passed": sum(1 for item in results if item["status"] == "PASS"),
        "failed": sum(1 for item in results if item["status"] == "FAIL"),
        "results": results,
    }


def write_index(output_dir: Path, records: Iterable[dict[str, Any]]) -> Path:
    path = output_dir / "asset_index.csv"
    rows = list(records)
    fields = ["module_id", "module_name", "tag", "meaning_zh", "meaning_en", "file", "status"]
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for item in rows:
            writer.writerow({field: item.get(field, "") for field in fields})
    return path


def batch(args: argparse.Namespace) -> int:
    spec_path = Path(args.spec).resolve()
    spec = read_json(spec_path)
    output_dir = (spec_path.parent / spec.get("output_dir", "output")).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    source_index = spec.get("source_index")
    source_rows: dict[tuple[str, str], dict[str, str]] = {}
    if source_index:
        index_path = Path(source_index)
        if not index_path.is_absolute():
            index_path = (spec_path.parent / index_path).resolve()
        with index_path.open("r", encoding="utf-8-sig", newline="") as handle:
            for row in csv.DictReader(handle):
                source_rows[(row.get("module_id", ""), row.get("tag", ""))] = row
    records: list[dict[str, Any]] = []
    # A batch run is a clean build: stale PNGs from an earlier spec must not
    # leak into the new QA report or output package.
    if output_dir.exists():
        for old in output_dir.glob("*.png"):
            old.unlink()
        for old_dir in output_dir.iterdir():
            if old_dir.is_dir() and not old_dir.name.startswith("."):
                shutil.rmtree(old_dir)
        for old in output_dir.glob(".*"):
            if old.is_dir():
                shutil.rmtree(old)
            else:
                old.unlink()
    for sheet in spec.get("sheets", []):
        sheet_path = Path(sheet["source"])
        if not sheet_path.is_absolute():
            sheet_path = (spec_path.parent / sheet_path).resolve()
        namespace = argparse.Namespace(
            input=str(sheet_path),
            out=str(output_dir / sheet["module_id"]),
            rows=int(sheet.get("rows", 3)),
            cols=int(sheet.get("cols", 4)),
            prefix=sheet.get("prefix", sheet["module_id"]),
            labels=sheet.get("labels", []),
            tolerance=int(spec.get("tolerance", DEFAULT_TOLERANCE)),
            min_luma=int(spec.get("min_luma", DEFAULT_MIN_LUMA)),
            neutral=int(spec.get("neutral", DEFAULT_NEUTRAL)),
            outline=int(spec.get("outline", DEFAULT_OUTLINE)),
            padding=int(spec.get("padding", DEFAULT_PADDING)),
        )
        for result in split_sheet(namespace):
            label = result["label"]
            source_row = source_rows.get((sheet["module_id"], label), {})
            records.append({
                "module_id": sheet["module_id"],
                "module_name": sheet.get("module_name", source_row.get("module_name", sheet["module_id"])),
                "tag": label,
                "meaning_zh": sheet.get("meanings", {}).get(label, source_row.get("meaning_zh", "")),
                "meaning_en": sheet.get("meanings_en", {}).get(label, label.replace("_", " ").title()),
                "file": str(Path(result["output"]).relative_to(output_dir)),
                "status": "PROCESSED",
                **result,
            })
    # split_sheet uses a module-local temporary directory. Remove any empty
    # module workspaces before the final QA pass and manifest write.
    for work_dir in output_dir.rglob(".working"):
        if work_dir.is_dir():
            shutil.rmtree(work_dir)
    index_path = write_index(output_dir, records)
    qa = validate_dir(output_dir)
    write_json(output_dir / "qa_report.json", qa)
    write_json(output_dir / "manifest.json", {
        "name": spec.get("name", "adaptive-sticker-asset-factory"),
        "version": spec.get("version", "1.0.0"),
        "assets": records,
        "index": str(index_path.relative_to(output_dir)),
        "qa": "qa_report.json",
    })
    print(json.dumps({"output_dir": str(output_dir), "index": str(index_path), "qa": qa}, ensure_ascii=False, indent=2))
    return 1 if qa["failed"] else 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Prepare and QA batch sticker PNG assets.")
    sub = parser.add_subparsers(dest="command", required=True)

    process = sub.add_parser("process", help="Remove checkerboard background from one image.")
    process.add_argument("--input", required=True)
    process.add_argument("--output", required=True)
    process.add_argument("--tolerance", type=int, default=DEFAULT_TOLERANCE)
    process.add_argument("--min-luma", type=int, default=DEFAULT_MIN_LUMA)
    process.add_argument("--neutral", type=int, default=DEFAULT_NEUTRAL)
    process.add_argument("--outline", type=int, default=DEFAULT_OUTLINE)
    process.add_argument("--padding", type=int, default=DEFAULT_PADDING)
    process.set_defaults(func=lambda args: (print(json.dumps(process_image(Path(args.input), Path(args.output), tolerance=args.tolerance, min_luma=args.min_luma, neutral=args.neutral, outline=args.outline, padding=args.padding), ensure_ascii=False, indent=2)) or 0))

    split = sub.add_parser("split-sheet", help="Split a sticker sheet into RGBA PNGs.")
    split.add_argument("--input", required=True)
    split.add_argument("--out", required=True)
    split.add_argument("--rows", type=int, default=3)
    split.add_argument("--cols", type=int, default=4)
    split.add_argument("--prefix", required=True)
    split.add_argument("--labels", nargs="*")
    split.add_argument("--tolerance", type=int, default=DEFAULT_TOLERANCE)
    split.add_argument("--min-luma", type=int, default=DEFAULT_MIN_LUMA)
    split.add_argument("--neutral", type=int, default=DEFAULT_NEUTRAL)
    split.add_argument("--outline", type=int, default=DEFAULT_OUTLINE)
    split.add_argument("--padding", type=int, default=DEFAULT_PADDING)
    split.set_defaults(func=lambda args: (print(json.dumps(split_sheet(args), ensure_ascii=False, indent=2)) or 0))

    batch_parser = sub.add_parser("batch", help="Process all sheets described by a JSON spec.")
    batch_parser.add_argument("--spec", required=True)
    batch_parser.set_defaults(func=batch)

    validate = sub.add_parser("validate", help="Validate all PNGs in a directory.")
    validate.add_argument("--dir", required=True)
    validate.add_argument("--report")
    def run_validate(args: argparse.Namespace) -> int:
        report = validate_dir(Path(args.dir).resolve())
        if args.report:
            write_json(Path(args.report).resolve(), report)
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return 1 if report["failed"] else 0
    validate.set_defaults(func=run_validate)
    return parser


if __name__ == "__main__":
    try:
        parsed = build_parser().parse_args()
        sys.exit(parsed.func(parsed))
    except KeyboardInterrupt:
        sys.exit(130)
