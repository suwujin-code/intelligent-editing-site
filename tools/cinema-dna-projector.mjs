#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const [inputArg, outputArg] = process.argv.slice(2);
if (!inputArg) {
  console.error('Usage: node tools/cinema-dna-projector.mjs <case.machine.json> [output-dir]');
  process.exit(1);
}

const inputPath = path.resolve(inputArg);
const outDir = path.resolve(outputArg || path.dirname(inputPath));
const machine = JSON.parse(await fs.readFile(inputPath, 'utf8'));

if (machine.schema_version !== 'CINEMA-DNA-TL-1.0.0') {
  throw new Error(`Unsupported schema_version: ${machine.schema_version}`);
}

const tb = machine.timebase || {};
if (!Number.isInteger(tb.fps_num) || !Number.isInteger(tb.fps_den) || tb.fps_num <= 0 || tb.fps_den <= 0) {
  throw new Error('timebase.fps_num / fps_den must be positive integers');
}

const seconds = frame => frame * tb.fps_den / tb.fps_num;
const duration = (start, end) => seconds(end - start);

function assertRange(entity, label) {
  if (!Number.isInteger(entity.start_frame) || !Number.isInteger(entity.end_frame)) {
    throw new Error(`${label} must use integer start_frame / end_frame`);
  }
  if (entity.start_frame < 0 || entity.end_frame < entity.start_frame) {
    throw new Error(`${label} has invalid frame range`);
  }
}

function assetMap() {
  return new Map((machine.assets || []).map(asset => [asset.asset_id, asset]));
}

const assets = assetMap();
const events = [];
const pushEvent = event => {
  assertRange(event, event.event_id || event.type || 'event');
  events.push({
    ...event,
    start_s: seconds(event.start_frame),
    end_s: seconds(event.end_frame),
    duration_frames: event.end_frame - event.start_frame,
    duration_s: duration(event.start_frame, event.end_frame)
  });
};

for (const section of machine.sections || []) {
  pushEvent({
    event_id: section.section_id,
    track: 'S0_SEMANTIC',
    type: 'SECTION',
    start_frame: section.start_frame,
    end_frame: section.end_frame,
    ref: `sections/${section.section_id}`
  });
}

for (const shot of machine.shots || []) {
  pushEvent({
    event_id: shot.shot_id,
    track: 'V0_SHOT',
    type: 'SHOT',
    start_frame: shot.start_frame,
    end_frame: shot.end_frame,
    ref: `shots/${shot.shot_id}`
  });

  for (const text of shot.typography || []) {
    pushEvent({
      event_id: text.text_id,
      track: 'V2_TYPOGRAPHY',
      type: text.role || 'TEXT',
      start_frame: text.start_frame,
      end_frame: text.end_frame,
      ref: `shots/${shot.shot_id}/typography/${text.text_id}`
    });
  }

  for (const motion of shot.motion || []) {
    pushEvent({
      event_id: motion.motion_id,
      track: motion.track || 'V3_MOTION_GRAPHICS',
      type: 'MOTION',
      start_frame: motion.start_frame,
      end_frame: motion.end_frame,
      ref: `shots/${shot.shot_id}/motion/${motion.motion_id}`
    });
  }

  if (shot.director_decision?.decision_id) {
    pushEvent({
      event_id: shot.director_decision.decision_id,
      track: 'D0_DECISION',
      type: 'DIRECTOR_DECISION',
      start_frame: shot.start_frame,
      end_frame: shot.end_frame,
      ref: `shots/${shot.shot_id}/director_decision`
    });
  }
}

const soundTrack = {
  VO: 'A0_VO',
  MUSIC_SECTION: 'A1_MUSIC',
  MUSIC: 'A1_MUSIC',
  BEAT: 'A1_MUSIC',
  ONSET: 'A1_MUSIC',
  SFX: 'A2_SFX',
  AMBIENCE: 'A3_AMBIENCE',
  SILENCE: 'A3_AMBIENCE',
  SOUND_BRIDGE: 'A3_AMBIENCE'
};

for (const sound of machine.sounds || []) {
  pushEvent({
    event_id: sound.audio_id || sound.sound_id,
    track: sound.track || soundTrack[sound.type] || 'A3_AMBIENCE',
    type: sound.type || 'SOUND',
    start_frame: sound.start_frame,
    end_frame: sound.end_frame,
    ref: `sounds/${sound.audio_id || sound.sound_id}`
  });
}

for (const beat of machine.beats || []) {
  const end = Number.isInteger(beat.end_frame) ? beat.end_frame : beat.start_frame + 1;
  pushEvent({
    event_id: beat.beat_id,
    track: 'A1_MUSIC',
    type: beat.type || 'BEAT',
    start_frame: beat.start_frame,
    end_frame: end,
    ref: `beats/${beat.beat_id}`
  });
}

events.sort((a, b) => a.start_frame - b.start_frame || a.end_frame - b.end_frame || a.track.localeCompare(b.track));

const csvEscape = value => {
  const text = value == null ? '' : Array.isArray(value) ? value.join(' | ') : typeof value === 'object' ? JSON.stringify(value) : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const shotColumns = [
  'shot_id','section_id','in_frame','out_frame','in_tc','out_tc','start_s','end_s','duration_frames','duration_s',
  'keyframe_asset_id','visual_description','semantic_goal','onscreen_text','transition','motion_summary','music_cue','sfx_cues',
  'director_decision','editor_action','reuse_tags','confidence','rights_status'
];

const shotRows = (machine.shots || []).map(shot => {
  assertRange(shot, shot.shot_id);
  const texts = (shot.typography || []).map(text => text.content).filter(Boolean);
  const motions = (shot.motion || []).map(motion => `${motion.target || ''}:${motion.semantic_function || ''}`).filter(Boolean);
  const music = (shot.audio_links || []).filter(id => /MUSIC|BEAT|ONSET/i.test(id));
  const sfx = (shot.audio_links || []).filter(id => /SFX|HIT|WHOOSH|CLICK|RISER/i.test(id));
  const row = {
    shot_id: shot.shot_id,
    section_id: shot.section_id,
    in_frame: shot.start_frame,
    out_frame: shot.end_frame,
    in_tc: shot.in_tc || '',
    out_tc: shot.out_tc || '',
    start_s: seconds(shot.start_frame).toFixed(6),
    end_s: seconds(shot.end_frame).toFixed(6),
    duration_frames: shot.end_frame - shot.start_frame,
    duration_s: duration(shot.start_frame, shot.end_frame).toFixed(6),
    keyframe_asset_id: shot.keyframe_asset_id || '',
    visual_description: shot.visual?.description || shot.visual_description || '',
    semantic_goal: shot.semantics?.goal || shot.semantics?.viewer_understanding || '',
    onscreen_text: texts,
    transition: shot.edit?.transition || shot.editing_relation || '',
    motion_summary: motions,
    music_cue: music,
    sfx_cues: sfx,
    director_decision: shot.director_decision?.decision || '',
    editor_action: shot.director_decision?.editor_action || shot.edit?.editor_action || '',
    reuse_tags: shot.reuse_tags || [],
    confidence: shot.confidence,
    rights_status: shot.rights_status
  };
  return shotColumns.map(column => csvEscape(row[column])).join(',');
});

function publicAsset(assetId) {
  if (!assetId) return null;
  const asset = assets.get(assetId);
  if (!asset || asset.public_display_gate !== 'PASS') return null;
  return asset.public_uri || asset.uri || null;
}

const publicGate = machine.public_projection?.public_display_gate || 'PENDING';
const publicShots = (machine.shots || [])
  .filter(shot => shot.public_showcase === true)
  .map(shot => ({
    shot_id: shot.shot_id,
    title: shot.public_title || '',
    start_frame: shot.start_frame,
    end_frame: shot.end_frame,
    start_s: seconds(shot.start_frame),
    end_s: seconds(shot.end_frame),
    timecode: shot.in_tc || `${seconds(shot.start_frame).toFixed(2)}s`,
    frame_url: publicGate === 'PASS' ? publicAsset(shot.keyframe_asset_id) : null,
    visual: shot.visual?.description || '',
    camera: shot.visual?.camera || shot.visual?.composition || '',
    layout: (shot.typography || []).map(text => `${text.role}: ${text.content}`).join(' · '),
    motion: (shot.motion || []).map(event => `${event.target}: ${event.semantic_function}`).join(' · '),
    sound: (shot.audio_links || []).join(' · '),
    director: shot.director_decision?.reason || shot.director_decision?.decision || '',
    tags: shot.reuse_tags || []
  }));

const publicMotion = (machine.shots || [])
  .flatMap(shot => (shot.motion || []).filter(event => event.public_showcase === true).map(event => ({
    ...event,
    shot_id: shot.shot_id
  })));

const publicSounds = (machine.sounds || []).filter(sound => sound.public_showcase === true);
const publicPatterns = (machine.patterns || []).filter(pattern =>
  pattern.public_showcase === true && ['QA_APPROVED', 'GOLD_STANDARD'].includes(pattern.status)
);

const projection = machine.public_projection || {};
const publicBreakdown = {
  schema_version: 'BREAKDOWN-PUBLIC-1.0.0',
  case_id: machine.case.case_id,
  slug: projection.slug || machine.case.case_id.toLowerCase(),
  title: projection.title || machine.case.title,
  kicker: projection.kicker || 'DIRECTOR BREAKDOWN / CINEMA DNA',
  status: machine.case.status,
  status_label: projection.status_label || machine.case.status,
  metadata: {
    duration: `${seconds(machine.case.duration_frames).toFixed(2)}s`,
    fps: `${tb.fps_num}/${tb.fps_den}`,
    resolution: machine.case.resolution,
    format: projection.format || machine.case.subtype || '',
    priority: projection.priority || ''
  },
  one_line_judgement: projection.one_line_judgement || '',
  intro: projection.intro || '',
  why_learn: projection.why_learn || [],
  tracks: projection.tracks || [
    ['V0_SHOT','镜头边界'],['V1_SUBJECT_UI','人物 / 产品 / UI'],['V2_TYPOGRAPHY','标题 / 数字 / 字幕'],
    ['V3_MOTION_GRAPHICS','图形 / 2.5D / 遮罩'],['S0_SEMANTIC','语义 / 证明'],['A0_VO','旁白'],
    ['A1_MUSIC','音乐'],['A2_SFX','设计音效'],['A3_AMBIENCE','环境 / 静默'],['D0_DECISION','导演判断']
  ].map(([id,label]) => ({id,label})),
  sections: (machine.sections || []).filter(section => section.public_showcase === true).map(section => ({
    ...section,
    start_s: seconds(section.start_frame),
    end_s: seconds(section.end_frame)
  })),
  storyboard: publicShots,
  motion_anatomy: publicMotion,
  sound_map: publicSounds,
  patterns: publicPatterns,
  gates: {
    source_master: machine.qa?.source_master || 'UNKNOWN',
    frame_analysis: machine.qa?.frame_analysis || 'UNKNOWN',
    audio_semantic_qa: machine.qa?.audio_semantic_qa || 'UNKNOWN',
    public_display_gate: publicGate
  },
  notice: projection.notice || ''
};

await fs.mkdir(outDir, { recursive: true });
await Promise.all([
  fs.writeFile(path.join(outDir, 'timeline.events.ndjson'), events.map(event => JSON.stringify(event)).join('\n') + '\n'),
  fs.writeFile(path.join(outDir, 'shots.csv'), `${shotColumns.join(',')}\n${shotRows.join('\n')}\n`),
  fs.writeFile(path.join(outDir, 'public.breakdown.json'), JSON.stringify(publicBreakdown, null, 2) + '\n')
]);

console.log(JSON.stringify({
  case_id: machine.case.case_id,
  events: events.length,
  shots: (machine.shots || []).length,
  public_storyboard: publicShots.length,
  public_display_gate: publicGate,
  output_dir: outDir
}, null, 2));
