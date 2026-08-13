# OING AI Skills

Reusable skills for creative automation. The first public skill is **智能贴纸资产工厂 / Adaptive Sticker Asset Factory**.

It turns a natural-language expression into a coherent sticker system: semantic bilingual tags, consistent prompts, batch sheet splitting, checkerboard/background removal, transparent RGBA PNG export, deterministic filenames, CSV/JSON indexes, and a QA report.

## Use the skill

Read `skills/adaptive-sticker-asset-factory/SKILL.md`, then run:

```bash
python3 skills/adaptive-sticker-asset-factory/scripts/sticker_pipeline.py batch --spec samples/spec.json
```

The sample contains ten modules and 120 assets. `samples/qa_report.json` is the final QA record: 120/120 passed.

The public repository keeps previews and metadata lightweight. Running the sample spec creates the 120 transparent PNG files under `samples/generated/`; the generated folder is intentionally not committed.

The sample spec is self-contained: its ten preview sheets live in `samples/preview-sheets/`, so it can be copied out and run without any local OING workspace paths.

## Repository layout

- `skills/<skill-name>/` — installable skill with scripts and references.
- `samples/` — public preview sheets, semantic index, manifest, and QA report.
- One repository, one directory per skill, so the ecosystem can grow without fragmenting versioning, review, or discovery.

## License

MIT. Generated sample artwork remains a sample reference for the OING AI Course design system.
