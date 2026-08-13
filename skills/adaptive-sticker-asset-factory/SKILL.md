---
name: adaptive-sticker-asset-factory
description: Generate reusable sticker systems from a natural-language idea, with bilingual semantic labels, batch sheet splitting, automatic checkerboard/background removal, transparent RGBA PNG export, deterministic filenames, CSV/JSON indexes, and a QA report. Use when a user asks for stickers, emoji-like overlays, AI editing labels, reaction assets, transparent PNG packs, or a scalable sticker language for a brand, course, product, or content workflow.
---

# 智能贴纸资产工厂 / Adaptive Sticker Asset Factory

## Overview

Turn one sentence describing an intended expression into a coherent sticker asset system. Keep the visual language consistent across a batch, keep semantic labels stable for AI editing, and always deliver usable RGBA PNGs with machine-readable indexes and a review queue.

## Core workflow

1. Parse the request into: theme, audience, emotional tone, visual style, target editor, number of assets, module/category, and brand constraints. If the user gives no count, propose 12 assets for one module or 10 modules × 12 assets for a system.

2. Build a semantic label list before generating visuals. Each asset needs:
   - `tag`: stable uppercase ASCII key used in filenames and AI-editing prompts;
   - `meaning_zh`: the Chinese meaning shown to people;
   - `meaning_en`: a short English gloss when the pack is shared publicly;
   - `module_id` and `module_name`: the category that keeps the system expandable.
   Prefer action/state labels such as `HOOK`, `CUT`, `REVIEW`, `EXPORT`, `WOW`, `NEEDS_FIX`; do not make the filename depend on a sentence translated by a model.

3. Generate artwork with the image-generation tool available in the current environment. Ask for a consistent sticker system: thick white die-cut border, dark keyline, restrained brand colors, clear silhouette, one idea per sticker, 3×4 or 4×4 separated cells, no scene background, no UI chrome, no watermark, and no accidental duplicate concepts. If exact typography matters, generate art without text and place text with a deterministic overlay tool; image models are not a reliable source of exact spelling.

4. Convert the generated sheet or individual images to final assets with the bundled script:

```bash
python3 scripts/sticker_pipeline.py batch --spec path/to/spec.json
python3 scripts/sticker_pipeline.py validate --dir path/to/output --report path/to/output/qa_report.json
```

The batch command creates `RGBA` PNGs, `asset_index.csv`, `manifest.json`, and `qa_report.json`. A failed item must stay in `needs_review/` or be reported as failed; never silently present a checkerboard or opaque image as a finished transparent PNG.

5. Inspect a representative sample visually and check the QA report. A valid asset is non-empty, has an alpha channel, has transparent outer corners, has a clean silhouette, and has no unintended sheet neighbors. If background removal damages a white outline or bubble, lower the tolerance or use an individual source image; do not ship a visibly damaged sticker.

6. Return deliverables in this order: preview/contact sheet, final PNG folder or zip, `asset_index.csv`, `manifest.json`, and QA summary. Explain any items routed to review.

## PNG decision rules

- Use an existing transparent RGBA source as-is when its alpha is real and passes QA.
- Use `process` for one image, `split-sheet` for one grid, and `batch` for a full multi-module system.
- The bundled remover is edge-connected: it removes light neutral checkerboard pixels connected to the image edge, then restores a small white die-cut edge around surviving artwork.
- For photos, complex gradients, hair, smoke, or glass, treat automatic removal as a draft and send the result to review. Use a dedicated segmentation tool when available, then run the same QA gate.
- Never flatten RGBA output into JPEG. A preview image with a colored background is not the production asset.

## Naming and index contract

Use this path shape:

`<output>/<MODULE_ID>/<MODULE_ID>-<NN>_<TAG>.png`

Keep `tag` stable when the illustration changes. The CSV is the handoff contract for AI editing: `module_id`, `module_name`, `tag`, `meaning_zh`, `meaning_en`, `file`, and `status`. The JSON manifest may add prompt, style, source, dimensions, and QA metadata.

## References

- Read [workflow.md](references/workflow.md) for prompt templates, module planning, and user-facing examples.
- Read [png-processing.md](references/png-processing.md) when the source is a checkerboard, white background, photo, or mixed-quality batch.
- Use [label-taxonomy.json](assets/label-taxonomy.json) as the starter vocabulary; extend it only when the new label is useful across more than one project.
