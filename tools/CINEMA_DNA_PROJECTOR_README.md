# Cinema DNA Projector

## 作用

`tools/cinema-dna-projector.mjs` 是统一时间线的投影器。

它只接受一个事实源：`case.machine.json`，并生成：

- `timeline.events.ndjson`：AI Director / Editor / AutoEdit / Agent 的统一事件流；
- `shots.csv`：剪辑师和人工 QA 的检查表；
- `public.breakdown.json`：智能剪辑网站“拉片库”的公开教学投影。

这三个文件不得成为新的独立事实源。

## 使用

```bash
node tools/cinema-dna-projector.mjs path/to/case.machine.json path/to/output-dir
```

## 写入责任

### Media Engineer
先写入原片事实：source_file_id / hash / probe / timebase / duration / resolution / source mapping。

### Script / Director
写入 SECTION、S0_SEMANTIC、director_decision；Director 只定义结构、节奏策略和 viewer change，不伪造镜头事实。

### Editor
写入真实 SHOT 边界、precise Cut、editing_relation、transition motivation；具体 Cut 必须是整数 frame。

### Art / Motion
写 typography[] / motion[]。Motion Event 必须包含 start/end frame、target、properties、easing 和 semantic_function。

### Sound Director
写 SOUND / BEAT / ONSET / phrase / SFX / ambience / silence；算法 BPM / onset 是候选，声音含义由独立听审确认。

### QA
只有 QA_APPROVED / GOLD_STANDARD Pattern 才能进入可迁移 DNA；公开关键帧必须通过 public_display_gate。

## 时间线变更失效规则

任何 `start_frame / end_frame` 改动都必须触发依赖检查：

- Typography timing → invalidated
- Motion timing → invalidated
- SFX timing → invalidated
- Subtitle timing → invalidated
- FCPXML / EDL / Remotion adapters → invalidated
- Public storyboard timecode → invalidated

保持历史版本，不覆盖旧收据。

## Public Projection

只有 `public_showcase: true` 的 Section / Shot / Motion / Sound / Pattern 才能进入公开投影。

图片资产还必须满足：

```json
{
  "public_display_gate": "PASS"
}
```

公开页只展示关键教学镜头；完整 Cut Index 始终保留在内部 machine timeline。

## AhaCreator 3.0

AHA-CREATOR-3 当前处于 source ingest pending。母版文件 ID 未取得前只允许建立项目、协议、预分析和公开页面骨架；不得填入猜测的 fps、Cut、Motion 曲线或关键帧。
