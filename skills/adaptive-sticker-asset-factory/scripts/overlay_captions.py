#!/usr/bin/env python3
"""Add deterministic handwritten captions to transparent sticker PNGs.

The artwork remains generated/illustrated, while exact Chinese copy is added
afterward with a real font. This avoids relying on image models for spelling.
"""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def wrap_caption(text: str, font: ImageFont.FreeTypeFont, max_width: int) -> str:
    """Wrap Chinese text by glyph width without inserting punctuation."""
    lines: list[str] = []
    current = ""
    for char in text.strip():
        candidate = current + char
        if current and font.getbbox(candidate)[2] > max_width:
            lines.append(current)
            current = char
        else:
            current = candidate
    if current:
        lines.append(current)
    return "\n".join(lines) or "…"


def multiline_bbox(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, spacing: int) -> tuple[int, int, int, int]:
    """Return Pillow's multiline text bounds with explicit line spacing."""
    return draw.multiline_textbbox((0, 0), text, font=font, spacing=spacing, stroke_width=0)


def fit_font(text: str, font_path: Path, max_width: int, start: int) -> tuple[ImageFont.FreeTypeFont, str]:
    size = max(18, start)
    while size >= 18:
        font = ImageFont.truetype(str(font_path), size=size)
        wrapped = wrap_caption(text, font, max_width)
        # FreeTypeFont.getbbox() does not accept multiline spacing; measure
        # each wrapped line directly so this also works across Pillow versions.
        line_width = max(font.getlength(line) for line in wrapped.splitlines())
        if line_width <= max_width:
            return font, wrapped
        size -= 2
    font = ImageFont.truetype(str(font_path), size=18)
    return font, wrap_caption(text, font, max_width)


def add_caption(source: Path, target: Path, caption: str, font_path: Path) -> dict:
    image = Image.open(source).convert("RGBA")
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if bbox:
        image = image.crop((max(0, bbox[0] - 10), max(0, bbox[1] - 10), min(image.width, bbox[2] + 10), min(image.height, bbox[3] + 10)))

    max_text_width = max(160, image.width - 28)
    font, wrapped = fit_font(caption, font_path, max_text_width, max(28, image.width // 8))
    spacing = max(4, font.size // 8)
    draw = ImageDraw.Draw(image)
    text_bbox = multiline_bbox(draw, wrapped, font, spacing)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    panel_h = text_height + font.size // 2 + 18
    canvas = Image.new("RGBA", (image.width, image.height + panel_h), (0, 0, 0, 0))
    canvas.alpha_composite(image, (0, 0))
    draw = ImageDraw.Draw(canvas)
    panel = (7, image.height - 5, canvas.width - 7, canvas.height - 7)
    draw.rounded_rectangle(panel, radius=16, fill=(255, 253, 246, 255), outline=(16, 16, 16, 255), width=4)
    x = (canvas.width - text_width) // 2 - text_bbox[0]
    y = image.height + (panel_h - text_height) // 2 - text_bbox[1] - 2
    draw.multiline_text((x, y), wrapped, font=font, fill=(15, 15, 15, 255), spacing=spacing, align="center")
    # A small hand-drawn accent keeps the caption integrated with the doodle.
    underline_y = canvas.height - 10
    draw.arc((canvas.width // 2 - 26, underline_y - 8, canvas.width // 2 + 26, underline_y + 8), 8, 172, fill=(104, 220, 0, 255), width=3)
    target.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(target, "PNG", optimize=True)
    return {"source": str(source), "output": str(target), "caption_zh": caption, "size": [canvas.width, canvas.height], "font": str(font_path)}


def main() -> int:
    parser = argparse.ArgumentParser(description="Overlay exact handwritten captions on RGBA sticker PNGs.")
    parser.add_argument("--input-dir", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--captions-csv", required=True, help="CSV with file and caption_zh columns.")
    parser.add_argument("--font", required=True, help="TTF/OTF font with the required glyphs.")
    parser.add_argument("--manifest")
    args = parser.parse_args()
    input_dir = Path(args.input_dir).resolve()
    output_dir = Path(args.output_dir).resolve()
    font_path = Path(args.font).resolve()
    rows = list(csv.DictReader(Path(args.captions_csv).open("r", encoding="utf-8-sig", newline="")))
    manifest = []
    for row in rows:
        rel = Path(row["file"])
        source = input_dir / rel
        target = output_dir / rel
        if not source.exists():
            raise FileNotFoundError(source)
        manifest.append(add_caption(source, target, row["caption_zh"], font_path))
    if args.manifest:
        path = Path(args.manifest).resolve()
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps({"count": len(manifest), "assets": manifest}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"count": len(manifest), "output_dir": str(output_dir), "manifest": args.manifest}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
