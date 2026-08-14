# Emotion-expression language system

Use this system when a sticker pack is meant to help people express their own emotions and needs. The goal is not to diagnose or speak for another person; it is to give the sender a low-pressure first-person sentence that can be understood in chat, captions, or AI editing notes.

## Six semantic layers

| Layer | Purpose | Example captions |
|---|---|---|
| `STATE` 状态 | Name the current condition without judgment. | 我有点累；我还在整理；我现在有点混乱 |
| `FEELING` 感受 | Name an emotion or reaction. | 我真的很开心；我有点担心；这让我很在意 |
| `NEED` 需要 | Make a concrete request for support or time. | 我需要一点时间；我需要一点空间；我想先缓一缓 |
| `BOUNDARY` 边界/方式 | State a limit or a preferred way to continue. | 我想换个方式；先让我想想；我还没准备好 |
| `CONNECTION` 连接/回应 | Invite listening, understanding, or mutual expression. | 我想听听你的感受；谢谢你告诉我；我们可以聊聊 |
| `SHARED_ACTION` 共同行动 | Turn the feeling into a manageable next step. | 我们慢慢来；我们一起想办法；我想到一个办法 |

## Copy rules

- Write in first person whenever the sticker represents the sender.
- Keep one caption to one intention; do not mix a feeling, explanation, and solution in one line.
- Prefer 4–10 Chinese characters for a single-line label; wrap only when the phrase needs more nuance.
- Use observable, non-accusatory language. Prefer “我现在有点混乱” to “你把我弄乱了”.
- Make room for consent and pacing: “让我想想”“我需要一点时间”“我想先听听”.
- Use the image to carry intensity and the caption to carry meaning. Do not ask the image model to render exact Chinese.

## Machine-readable contract

Keep the visual tag stable and store the human language separately:

```csv
module_id,tag,layer,caption_zh,meaning_en,file,status
S01,PROMPT,STATE,我有点累,I feel a little tired,S01/S01-01_PROMPT.png,ready
S01,REVIEW,CONNECTION,我想听听你的感受,I want to hear how you feel,S01/S01-06_REVIEW.png,ready
S01,FIX,NEED,我需要一点时间,I need a little time,S01/S01-07_FIX.png,ready
```

Render `caption_zh` deterministically after the artwork is generated. Use `scripts/overlay_captions.py` for a batch and preserve the source tag in the output filename. Validate the resulting RGBA directory with `scripts/sticker_pipeline.py validate` and visually inspect at least one long caption, one short caption, and one caption with a punctuation mark.
