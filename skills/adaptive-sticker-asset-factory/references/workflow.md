# 工作流参考 / Workflow reference

## 1. Prompt skeleton

Use this structure when asking an image generator for a sheet:

> Create a coherent set of [count] die-cut sticker illustrations for [brand/project]. The semantic labels are: [TAG list]. One sticker per cell, arranged in a clean [rows]×[cols] grid with generous spacing. Style: [style], thick white outline, dark keyline, compact silhouette, high contrast, no scene background, no UI chrome, no watermark, no extra labels, no accidental duplicate concepts. Keep all stickers visually related but make every cell immediately distinguishable.

When exact words are required, use:

> Do not render any words inside the artwork. Reserve a clear area for a text overlay; the exact label will be added after generation.

## 2. Module planning

Start with one module of 12 assets. For a complete production/content system, use ten modules and keep the same 12-position rhythm:

| Module | Purpose | Example tags |
|---|---|---|
| AI prompt | express input and reasoning | PROMPT, CONTEXT, INPUT, OUTPUT, THINK, ASK, MODEL, AGENT, MEMORY, TOOLS, TEST, LOOP |
| Video editing | express timeline actions | CUT, TRIM, SPLIT, MERGE, TIMELINE, BROLL, LAYER, SYNC, FRAME, PLAY, PAUSE, EXPORT |
| Audio/voice | express sound workflow | VOICE, RECORD, DUB, MUSIC, SFX, WAVEFORM, MIX, DUCK, SYNC, CLEAN, LOUDNESS, MASTER |
| Director/story | express story decisions | IDEA, HOOK, STORY, SCENE, SHOT, CHARACTER, CONFLICT, TURN, EMOTION, ENDING, NOTE, APPROVE |
| Design/layout | express visual design | GRID, TYPE, COLOR, IMAGE, ICON, SPACING, ALIGN, HIERARCHY, CONTRAST, BRAND, MOCKUP, POLISH |
| Motion | express animation | EASE, KEYFRAME, LOOP, REVEAL, POP, SLIDE, ZOOM, SHAKE, BLUR, MORPH, HOLD, OUTRO |
| Workflow/automation | express operations | TRIGGER, ACTION, ROUTE, WEBHOOK, API, DATA, BATCH, QUEUE, RETRY, LOG, ALERT, DONE |
| Review/quality | express review states | CHECK, PASS, FAIL, FIX, REVIEW, QA, CLEAN, WARNING, BLOCKED, READY, VERSION, SIGNOFF |
| Product/tech | express product/engineering | BUILD, CODE, BUG, DEPLOY, SERVER, DATABASE, CLOUD, SECURITY, SPEED, TEST, RELEASE, SCALE |
| Publish/growth | express distribution | PUBLISH, SCHEDULE, POST, SHARE, CTA, AUDIENCE, REACH, SAVE, COMMENT, FOLLOW, GROW, REPORT |

## 3. Input spec

The batch script accepts JSON. Paths are relative to the spec file unless absolute.

```json
{
  "name": "my-sticker-system",
  "version": "1.0.0",
  "output_dir": "output",
  "outline": 3,
  "padding": 10,
  "sheets": [
    {
      "module_id": "S01",
      "module_name": "AI_PROMPT",
      "source": "sources/ai-prompt.png",
      "rows": 3,
      "cols": 4,
      "prefix": "S01",
      "labels": ["PROMPT", "CONTEXT", "INPUT", "OUTPUT"],
      "meanings": {"PROMPT": "提示词输入", "OUTPUT": "输出结果"}
    }
  ]
}
```

The number of labels may be lower than the grid size; omitted cells receive `ASSET_XX` and should be renamed before publishing.

## 4. User-facing examples

- “把‘剪辑完成、需要返工、太棒了、等一下’做成 12 张同一套贴纸，并导出透明 PNG。”
- “为 AI 剪辑做一套 10 个模块的标签贴纸，文件名要能让模型理解。”
- “把这张棋盘格预览图拆成单张 PNG，去掉背景并给我 CSV 索引。”

For every request, preserve the semantic vocabulary even if the visual style changes.
