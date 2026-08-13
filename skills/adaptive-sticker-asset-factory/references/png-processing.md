# PNG 处理参考 / PNG processing reference

## Pipeline

1. Read the raster as RGBA.
2. Detect light neutral background colors from the outer border.
3. Flood-fill only edge-connected background pixels. This prevents enclosed white speech bubbles from being removed.
4. Rebuild a small white die-cut outline around surviving artwork.
5. Trim to the alpha bounding box with padding.
6. Save PNG with `optimize=True` and validate RGBA mode, alpha bbox, transparent corners, and non-empty content.

## Commands

```bash
python3 scripts/sticker_pipeline.py process --input preview.png --output final.png
python3 scripts/sticker_pipeline.py split-sheet --input sheet.png --out output/S01 --rows 3 --cols 4 --prefix S01 --labels PROMPT CONTEXT INPUT OUTPUT
python3 scripts/sticker_pipeline.py batch --spec spec.json
```

## Tuning

- Increase `--tolerance` only when a checkerboard remains; too much tolerance can remove pale artwork.
- Lower `--min-luma` for a gray background; raise it when the illustration contains pale gray fill that must survive.
- Increase `--outline` when the sticker edge is too thin; decrease it when small assets look bloated.
- Use an individual source image for hair, smoke, glass, or photographic subjects. The sheet remover is designed for clean graphic stickers, not general segmentation.

## QA gate

The output is not ready when `qa_report.json` contains failures. Common failure meanings:

- `missing_rgba`: the file was flattened or saved as RGB.
- `background_may_remain`: one or more outer corners are still opaque.
- `empty_alpha`: the remover erased the whole asset.
- `too_small`: the crop produced no meaningful artwork.

When a batch has mixed quality, keep passing files in the final folder and copy failed files to a review folder with the original source and the report entry. Do not silently retry with aggressive thresholds.
