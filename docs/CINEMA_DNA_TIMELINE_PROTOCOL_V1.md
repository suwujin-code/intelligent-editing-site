# CINEMA DNA Timeline Protocol v1.0

> Director / Editor / Art / Sound / AutoEdit / Website 的统一时间线协议。

## 0. 目的

拉片不是一份“观后感”，而是一份可追溯、可执行、可复用的视听数据资产。

同一个 Case 必须从一份权威数据派生四种输出：

1. **Machine Case JSON**：AI Director / Editor / Search / QA 的完整事实源。
2. **Timeline NDJSON**：按统一时间轴展开的事件流，供 AutoEdit / Agent / NLE Adapter 消费。
3. **Shot CSV**：人类剪辑师、表格工具、批处理最容易检查的平面表。
4. **Public Breakdown JSON**：经过 rights / privacy / confidence 过滤后，用于网站“拉片库”的对外展示数据。

禁止四套输出各自人工维护。它们必须由同一份 Machine Case JSON 生成。

---

## 1. 时间基准：Frame First

### 1.1 唯一权威坐标

所有可执行事件以整数帧为唯一权威坐标：

- `start_frame`：包含该帧（inclusive）
- `end_frame`：不包含该帧（exclusive）
- `duration_frames = end_frame - start_frame`

秒数与 SMPTE Timecode 都是派生字段：

- `start_s = start_frame * fps_den / fps_num`
- `end_s = end_frame * fps_den / fps_num`
- `duration_s = duration_frames * fps_den / fps_num`

### 1.2 FPS 必须用有理数

```json
{
  "timebase": {
    "fps_num": 25,
    "fps_den": 1,
    "drop_frame": false,
    "source_start_tc": "00:00:00:00",
    "canonical_unit": "frame"
  }
}
```

29.97 使用 `30000/1001`，23.976 使用 `24000/1001`，禁止只保存近似浮点数。

### 1.3 VFR 素材

VFR 原片必须由 Media Engineer 先建立可追溯 CFR Analysis Proxy，并记录：

- 原片 hash / probe；
- proxy hash / fps；
- source PTS ↔ analysis frame 映射；
- 后续所有导演、剪辑、字幕、音乐和动效判断都在同一个 analysis timebase 上进行。

---

## 2. 统一对象模型

保留 Cinema DNA V2 已有七类核心对象，不另造互不兼容的体系：

- `CASE`：整片事实、目标、来源与权限
- `SECTION`：叙事段落
- `SHOT`：视觉编辑单元
- `BEAT`：音乐节拍 / 瞬态 / 结构边界
- `SOUND`：VO / Music / SFX / Ambience / Silence
- `ASSET`：原片、关键帧、UI、字体、图形、音频等资产
- `PATTERN`：可迁移导演 / 剪辑 / 视觉 / 声音规律

在 `SHOT` 内增加可执行的 `semantics / typography / motion / edit / audio_links / director_decision`，解决 Motion Design、排版、声音与剪辑无法在同一时间线上沟通的问题。

---

## 3. 统一 Track Vocabulary

所有角色共享同一组 track 名称：

| Track | 所有者 | 含义 |
|---|---|---|
| `V0_SHOT` | Editor | 主视觉镜头边界 |
| `V1_SUBJECT_UI` | Art / Editor | 人物、产品、UI 卡片等主体 |
| `V2_TYPOGRAPHY` | Art | 标题、字幕、数字、标签 |
| `V3_MOTION_GRAPHICS` | Art / Motion | 图形、遮罩、2.5D、粒子、过渡图形 |
| `S0_SEMANTIC` | Script / Director | 语义单元、论点、证据、观众变化 |
| `A0_VO` | Sound | 旁白 / 对白 |
| `A1_MUSIC` | Sound | 音乐段落、节拍、结构 |
| `A2_SFX` | Sound | Whoosh / Hit / Click / Riser 等设计音效 |
| `A3_AMBIENCE` | Sound | 环境与底噪 |
| `D0_DECISION` | Director | 导演决策及其执行理由 |

Editor 不需要猜“导演说的快一点是什么意思”：导演必须把节奏决策落到 section / shot / frame 范围；Art 和 Sound 的事件也必须引用同一 frame range。

---

## 4. Case JSON 核心结构

```json
{
  "schema_version": "CINEMA-DNA-TL-1.0.0",
  "case": {},
  "timebase": {},
  "sections": [],
  "shots": [],
  "beats": [],
  "sounds": [],
  "assets": [],
  "patterns": [],
  "qa": {},
  "public_projection": {}
}
```

### 4.1 CASE 必备字段

`case_id / title / source_file_id / source_hash / duration_frames / duration_s / resolution / fps / primary_brain / subtype / status / rights_status / audio_status / version`

### 4.2 SECTION 必备字段

`section_id / start_frame / end_frame / start_s / end_s / director_function / narrative_function / emotional_function / density / breathing_point / transition_in / transition_out`

### 4.3 SHOT 必备字段

每一个视觉编辑单元至少包含：

- ID 与 `section_id`
- `start_frame / end_frame` + 派生秒数 / timecode
- `keyframe_asset_id`
- `visual`：画面事实、构图、景别、镜头、光线、色彩、材质、层级
- `semantics`：当前说什么、证明什么、让观众理解什么
- `typography[]`：文字类型、内容、位置、版式、入退场
- `motion[]`：运动对象、属性、范围、from/to、easing、overshoot、stagger、语义功能
- `edit`：前后镜关系、切点动机、转场媒介
- `audio_links[]`：引用声音事件
- `director_decision`：决定 / 依据 / 原因 / viewer reaction / execution / risk
- `reuse_tags / confidence / rights_status`

---

## 5. Motion Event：动画必须可执行

```json
{
  "motion_id": "MOT-017",
  "track": "V1_SUBJECT_UI",
  "target": "creator_card_stack",
  "start_frame": 310,
  "end_frame": 326,
  "properties": {
    "position": {"from": [0.18, 0.52], "to": [0.50, 0.52], "unit": "normalized"},
    "scale": {"from": 0.82, "to": 1.0},
    "opacity": {"from": 0, "to": 1},
    "blur_px": {"from": 12, "to": 0}
  },
  "easing": "cubic-bezier(0.22,1,0.36,1)",
  "overshoot": 0.03,
  "stagger_frames": 2,
  "semantic_function": "把规模增长变成可见的空间扩张",
  "confidence": 0.92
}
```

坐标默认使用 0–1 normalized canvas，确保 16:9 / 9:16 / 1:1 可转换；像素值可作为 `measured_px` 辅助字段保留。

**禁止只写“卡片丝滑飞入”“高级转场”这种不可执行描述。**

---

## 6. Typography Event：排版也进入时间线

每个文字事件记录：

`text_id / role / content / start_frame / end_frame / anchor / bbox_normalized / font_family / weight / size_ratio / line_height / tracking / alignment / color / shadow / mask / enter_motion_id / exit_motion_id / semantic_priority`

`role` 统一使用：

- `NARRATIVE_TITLE`
- `PROOF_NUMBER`
- `UI_EVIDENCE`
- `SUBTITLE`
- `LABEL`
- `CTA`
- `END_CARD`

这样 Director 说“把 500+ 变成证明数字”，Art 与 Editor 能直接识别它不是普通字幕。

---

## 7. Sound / Music：不仅要 BPM，还要理解

Sound 事件分为：

- `VO`
- `MUSIC_SECTION`
- `BEAT`
- `ONSET`
- `SFX`
- `AMBIENCE`
- `SILENCE`
- `SOUND_BRIDGE`

音乐不只记录 BPM，至少还要记录：

`music_role / section_function / energy / density / instrumentation / pulse / phrase_boundary / rise_drop / emotional_meaning / cut_relation / ducking_relation / confidence`

例如“这里音乐加速”不够；应说明：

> 该段把 UI 功能证明从解释阶段推入规模证明，音频瞬态密度上升，Cut 更贴 onset 而非机械贴全局 beat。

算法 BPM / onset 只能是事实候选；音乐语义必须经 Sound Director 独立听审。

---

## 8. Director → Editor Handoff Contract

导演交给剪辑师的关键决定必须包含：

- `range`：section / shot / start_frame / end_frame
- `decision`：决定是什么
- `goal`：为什么
- `evidence`：依据什么原片事实
- `viewer_reaction`：希望观众发生什么变化
- `editor_action`：剪辑具体怎么执行
- `sound_action`：声音怎样承接
- `art_action`：文字 / UI / 图形怎样承接
- `alternative`：低成本替代
- `invalidate_if_changed`：什么改变后该决定失效

Director 定义结构与节奏原则；Editor 拥有具体切点。任何具体 Cut 最终必须回写为 frame boundary。

---

## 9. Flat Timeline NDJSON

Machine Case JSON 是事实源；执行层可生成扁平事件流：

```json
{"event_id":"SH-017","track":"V0_SHOT","start_frame":300,"end_frame":342,"type":"SHOT","ref":"shots/SH-017"}
{"event_id":"TXT-017A","track":"V2_TYPOGRAPHY","start_frame":306,"end_frame":338,"type":"PROOF_NUMBER","ref":"shots/SH-017/typography/0"}
{"event_id":"MOT-017A","track":"V1_SUBJECT_UI","start_frame":310,"end_frame":326,"type":"MOTION","ref":"shots/SH-017/motion/0"}
{"event_id":"SFX-009","track":"A2_SFX","start_frame":325,"end_frame":330,"type":"HIT","ref":"sounds/SFX-009"}
```

所有角色看到的是同一个 frame coordinate，因此不会出现“导演说 12 秒、剪辑理解成另一个 12 秒”的问题。

---

## 10. Shot CSV（AutoEdit / 人工检查）

固定列：

`shot_id,section_id,in_frame,out_frame,in_tc,out_tc,start_s,end_s,duration_frames,duration_s,keyframe_asset_id,visual_description,semantic_goal,onscreen_text,transition,motion_summary,music_cue,sfx_cues,director_decision,editor_action,reuse_tags,confidence,rights_status`

CSV 是派生输出，不得反向成为唯一事实源。

---

## 11. 对外 Public Breakdown Projection

网站只读取经过筛选的 `public.breakdown.json`：

### 页面结构

1. **Hero / 整片介绍**：片名、来源、时长、比例、FPS、类型、一句话导演判断。
2. **为什么值得学**：本片最有价值的导演 / 剪辑 / Motion / 排版 / 声音方法。
3. **整体结构时间线**：Section、时间、内容、导演任务、声音能量。
4. **关键分镜表**：关键帧图片 + 时间码 + 画面 + 摄影 / 版式 + 动画 + 声音 / 音乐 + 导演判断 + 标签。
5. **Motion Anatomy**：重点动画逐项展开，显示帧范围、属性、easing、语义作用。
6. **Sound Map**：音乐段落、beat/onset、SFX、静默、声音桥。
7. **可复用 DNA**：Pattern、适用场景、边界条件。

公开关键分镜不等于内部完整 Cut Index。内部保存全部编辑单元；公开只投影最有教学价值的镜头簇。

### 权利门禁

公开投影必须满足 `public_display_gate = PASS`。权利未知时可以内部学习，但不得把内部 source asset 自动发布为公开素材。

---

## 12. 文件命名标准

每条 Case 固定输出：

```text
CASE_ID/
├── case.machine.json
├── timeline.events.ndjson
├── shots.csv
├── public.breakdown.json
├── storyboard/
│   ├── SH-001.webp
│   └── ...
├── report/
│   ├── director-breakdown.md
│   └── director-storyboard.pdf
├── qa/
│   └── gates.json
└── adapters/
    ├── fcpxml/
    ├── edl/
    └── remotion/
```

FCPXML / EDL / Remotion 工程是 Adapter 输出，不是事实源。

---

## 13. AhaCreator 3.0 首个升级样本

AhaCreator 3.0 作为本协议第一个 Motion-heavy 样本，拉片优先级：

1. Motion Design
2. Typography / Layout
3. Creative Translation / Motion-to-Meaning
4. Aesthetic System
5. Editing Rhythm
6. Music / SFX / Voice relation
7. Narrative / Product Proof

复刻流程：**母版取证 → 逐帧重建 → A/B 差分 → 1:1 技术复刻 → 再反推可迁移 Cinema DNA**。

未拿到母版文件 ID 前，不得伪造镜头时码、关键帧或运动曲线。
