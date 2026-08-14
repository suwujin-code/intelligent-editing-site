(() => {
  const root = document.querySelector('#app');
  if (!root) return;

  const INDEX_URL = 'data/breakdowns/index.json';
  const cache = new Map();

  const esc = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const safeDomId = (value = '') => String(value).replace(/[^a-zA-Z0-9_-]/g, '-');

  async function getJSON(url) {
    if (cache.has(url)) return cache.get(url);
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const data = await response.json();
    cache.set(url, data);
    return data;
  }

  function statusClass(status = '') {
    return ['QA_APPROVED', 'GOLD_STANDARD', 'PUBLISHED'].includes(status) ? 'ready' : '';
  }

  function tagList(tags = []) {
    return `<div class="bd-tags">${tags.map(tag => `<span class="bd-tag">${esc(tag)}</span>`).join('')}</div>`;
  }

  function loading(title = '正在读取拉片数据') {
    root.innerHTML = `<section class="bd-page"><div class="bd-empty"><strong>${esc(title)}</strong><p>拉片库从公开投影 JSON 读取，不在页面里复制维护第二套数据。</p></div></section>`;
  }

  function errorView(error) {
    root.innerHTML = `<section class="bd-page"><button class="bd-back" onclick="location.hash='project/intelligent-editing'">← 返回智能剪辑</button><div class="bd-empty"><strong>拉片数据暂时读取失败</strong><p>${esc(error?.message || 'Unknown error')}。页面代码仍保留，待数据接口恢复后会直接读取同一份公开投影。</p></div></section>`;
  }

  function caseCard(item) {
    return `<button class="bd-case-card" type="button" data-bd-case="${esc(item.slug)}">
      <span class="bd-code">${esc(item.case_id)}</span>
      <h3>${esc(item.title)}</h3>
      <p>${esc(item.subtitle)}</p>
      <span class="bd-status ${statusClass(item.status)}"><i></i>${esc(item.status_label)}</span>
      ${tagList(item.tags)}
    </button>`;
  }

  async function renderLibrary() {
    loading();
    try {
      const index = await getJSON(INDEX_URL);
      root.innerHTML = `<section class="bd-page">
        <button class="bd-back" onclick="location.hash='project/intelligent-editing'">← 返回智能剪辑</button>
        <header class="bd-hero">
          <div>
            <div class="bd-eyebrow">CINEMA DNA / BREAKDOWN LIBRARY</div>
            <h1>不是看完一条片，<em>而是把它拆成可复用能力。</em></h1>
            <p class="bd-lead">这里展示导演关键分镜、画面语言、排版、Motion Design、声音关系与可复用 DNA。公开页用于学习；内部完整 Cut Index 与机器时间线用于 AI Director / Editor 真正执行。</p>
          </div>
          <aside class="bd-hero-note">
            <span>ONE SOURCE · TWO VIEWS</span>
            <strong>一份 Cinema DNA<br>同时服务人和机器</strong>
            <small>公开：关键帧 + 导演讲解。内部：Frame-first 时间线 + 全部镜头 + Motion / Sound / QA。</small>
          </aside>
        </header>

        <section class="bd-section">
          <div class="bd-section-head"><div><div class="bd-eyebrow">CASES</div><h2>拉片案例</h2></div><p>每条 Case 只有通过源事实、时间码和权利门禁后，才会把原片关键帧投影到公开学习页。</p></div>
          <div class="bd-case-grid">${(index.cases || []).map(caseCard).join('')}</div>
        </section>

        <section class="bd-section">
          <div class="bd-section-head"><div><div class="bd-eyebrow">SHARED LANGUAGE</div><h2>导演和剪辑使用同一条时间线</h2></div><p>导演可以用秒思考，但执行层最终落到整数帧。秒数、SMPTE、字幕、Motion、音乐瞬态都从相同 frame coordinate 派生。</p></div>
          <div class="bd-protocol-grid">
            <article class="bd-protocol-card"><span>01 / TRUTH</span><strong>Frame First</strong><small>start_frame / end_frame 是唯一执行坐标，解决浮点秒数漂移。</small></article>
            <article class="bd-protocol-card"><span>02 / HUMAN</span><strong>Seconds + TC</strong><small>网页和导演仍显示 12.36s / 00:00:12:09，便于沟通和复盘。</small></article>
            <article class="bd-protocol-card"><span>03 / MACHINE</span><strong>JSON + NDJSON</strong><small>Director / Editor / Sound / AutoEdit 读取同一 Case 数据。</small></article>
            <article class="bd-protocol-card"><span>04 / NLE</span><strong>CSV + Adapters</strong><small>FCPXML / EDL / Remotion 由事实源生成，不反向成为唯一标准。</small></article>
          </div>
        </section>
      </section>`;

      root.querySelectorAll('[data-bd-case]').forEach(button => {
        button.addEventListener('click', () => {
          location.hash = `breakdown/${button.dataset.bdCase}`;
        });
      });
    } catch (error) {
      errorView(error);
    }
  }

  function metaGrid(data) {
    const entries = Object.entries(data.metadata || {});
    return `<div class="bd-meta">${entries.map(([key, value]) => `<div><small>${esc(key)}</small><strong>${esc(value)}</strong></div>`).join('')}</div>`;
  }

  function learningGrid(items = []) {
    return `<div class="bd-learning">${items.map(item => `<article><b>${esc(item.index)}</b><h3>${esc(item.title)}</h3><p>${esc(item.body)}</p></article>`).join('')}</div>`;
  }

  function trackMap(tracks = []) {
    return `<div class="bd-track-map">${tracks.map(track => `<div class="bd-track"><span class="bd-track-label">${esc(track.id)}<br>${esc(track.label)}</span><div class="bd-track-line"></div></div>`).join('')}</div>`;
  }

  function sectionTable(sections = []) {
    if (!sections.length) return `<div class="bd-empty"><strong>结构时码等待母版确认</strong><p>结构逻辑可以预分析，但开始帧 / 结束帧必须来自真实 MP4，不用公开视频或印象值冒充母版数据。</p></div>`;
    return `<div class="bd-storyboard">${sections.map(section => `<article class="bd-shot"><div class="bd-shot-copy" style="grid-column:1/-1"><div class="bd-shot-title"><strong>${esc(section.section_id)} · ${esc(section.title || section.director_function)}</strong><span>${esc(section.in_tc || section.start_s)} → ${esc(section.out_tc || section.end_s)}</span></div><div class="bd-field"><small>主要内容</small><p>${esc(section.content || section.narrative_function)}</p></div><div class="bd-field"><small>导演任务</small><p>${esc(section.director_function)}</p></div></div></article>`).join('')}</div>`;
  }

  function shotMedia(shot) {
    if (shot.frame_url) return `<img src="${esc(shot.frame_url)}" alt="${esc(shot.shot_id)} 关键帧" loading="lazy">`;
    if (shot.video_url) return `<video muted controls preload="metadata" playsinline src="${esc(shot.video_url)}#t=${Number(shot.start_s || 0).toFixed(2)}"></video>`;
    return `<div class="bd-media-pending">关键帧尚未通过<br>Public Display Gate</div>`;
  }

  function field(label, value) {
    if (!value) return '';
    return `<div class="bd-field"><small>${esc(label)}</small><p>${esc(Array.isArray(value) ? value.join(' · ') : value)}</p></div>`;
  }

  function storyboard(shots = []) {
    if (!shots.length) return `<div class="bd-empty"><strong>逐帧表等待母版同步</strong><p>母版取得后，这里会按真实时间线显示：关键帧图片、IN/OUT、画面、摄影/构图、版式、Motion、音乐/SFX、导演判断与可复用标签。内部完整 Cut Index 会比公开页更细。</p></div>`;
    return `<div class="bd-storyboard">${shots.map(shot => `<article class="bd-shot">
      <div class="bd-shot-media">${shotMedia(shot)}</div>
      <div class="bd-shot-copy">
        <div class="bd-shot-title"><strong>${esc(shot.shot_id)} · ${esc(shot.title || shot.visual)}</strong><span>${esc(shot.timecode || shot.in_tc || shot.start_s)}</span></div>
        ${field('画面', shot.visual)}${field('摄影 / 构图', shot.camera)}${field('排版', shot.layout)}${field('动画 / Motion', shot.motion)}${field('声音 / 音乐', shot.sound)}${field('导演判断', shot.director)}${field('可复用标签', shot.tags)}
      </div>
    </article>`).join('')}</div>`;
  }

  function textValue(value) {
    return value == null || value === '' ? '—' : Array.isArray(value) ? value.join(' · ') : String(value);
  }

  function shotTime(shot = {}) {
    return shot.timecode || shot.in_tc || shot.start_s || '';
  }

  function tableMedia(shot) {
    if (shot.frame_url) return `<img src="${esc(shot.frame_url)}" alt="${esc(shot.shot_id)} 关键帧" loading="lazy">`;
    return '';
  }

  function shotTable(shots = []) {
    if (!shots.length) return `<div class="bd-empty"><strong>逐帧表等待母版同步</strong><p>母版取得后，这里会按真实时间线显示可公开的镜头事实。内部完整 Cut Index 会比公开页更细。</p></div>`;
    const hasFrames = shots.some(shot => Boolean(shot.frame_url));
    const value = (item) => esc(textValue(item));
    return `<div class="bd-storyboard-table-wrap" role="region" aria-label="逐镜头分镜表" tabindex="0">
      <table class="bd-storyboard-table ${hasFrames ? '' : 'is-text-only'}">
        <thead><tr><th>视觉单元</th>${hasFrames ? '<th>关键帧</th>' : ''}<th>画面 / 内容</th><th>镜头 / 构图</th><th>运动 / 转场</th><th>声音 / 导演判断</th></tr></thead>
        <tbody>${shots.map(shot => `<tr>
          <th scope="row" class="bd-table-id"><strong>${esc(shot.shot_id)}</strong><span>${esc(shot.title || '')}</span><small>${esc(shot.section || '')} · ${esc(shotTime(shot))}</small></th>
          ${hasFrames ? `<td><div class="bd-table-media">${tableMedia(shot)}</div></td>` : ''}
          <td>${value(shot.visual)}</td>
          <td>${value(shot.camera)}</td>
          <td>${value(shot.motion || shot.transition)}</td>
          <td><div class="bd-table-director"><span>${value(shot.sound)}</span><strong>${value(shot.director)}</strong></div></td>
        </tr>`).join('')}</tbody>
      </table>
    </div>`;
  }

  function publicCoverage(data = {}) {
    const shots = data.storyboard || [];
    const publishedFromData = Number(data.public_view?.published_keyframes);
    const measuredFrames = shots.filter(shot => Boolean(shot.frame_url)).length;
    const published = Number.isFinite(publishedFromData) ? publishedFromData : measuredFrames;
    const totalFromData = Number(data.public_view?.total_visual_units);
    const total = Number.isFinite(totalFromData) && totalFromData > 0 ? totalFromData : shots.length;
    return {
      published,
      total,
      mode: data.public_view?.label || (published ? '关键分镜版' : '文字拉片版'),
      note: data.public_view?.note || (published ? '本页只展示已通过公开门禁的教学关键帧。' : '已完成镜头文字分析，原片关键帧未进入公开展示。')
    };
  }

  function groupStoryboard(data = {}) {
    const groups = (data.sections || []).map((section, index) => ({ ...section, index, shots: [] }));
    const ungrouped = { section_id: '其它', title: '补充单元', content: '未归入既有结构的镜头。', director_function: '补充说明。', index: groups.length, shots: [] };
    const inRange = (value, from, to, includeEnd = false) => (
      Number.isFinite(value)
      && Number.isFinite(from)
      && Number.isFinite(to)
      && value >= from
      && (includeEnd ? value <= to : value < to)
    );
    const within = (shot, section, index) => {
      const includeEnd = index === groups.length - 1;
      const shotFrame = Number(shot.start_frame);
      const sectionStartFrame = Number(section.start_frame);
      const sectionEndFrame = Number(section.end_frame);
      if (Number.isFinite(shotFrame) && Number.isFinite(sectionStartFrame) && Number.isFinite(sectionEndFrame)) {
        return inRange(shotFrame, sectionStartFrame, sectionEndFrame, includeEnd);
      }
      return inRange(Number(shot.start_s), Number(section.start_s), Number(section.end_s), includeEnd);
    };
    (data.storyboard || []).forEach(shot => {
      const direct = groups.find(group => group.section_id === shot.section);
      const byTime = groups.find((group, index) => within(shot, group, index));
      (direct || byTime || ungrouped).shots.push(shot);
    });
    if (ungrouped.shots.length) groups.push(ungrouped);
    if (!groups.length && (data.storyboard || []).length) {
      groups.push({ section_id: 'ALL', title: '全部分镜', content: '按时间线排列。', director_function: '查看完整拉片。', index: 0, shots: data.storyboard || [] });
    }
    return groups.filter(group => group.shots.length);
  }

  function sectionTime(section = {}) {
    return section.in_tc || (section.start_s != null ? `00:${String(Math.floor(Number(section.start_s) / 60)).padStart(2, '0')}.${String(Math.round(Number(section.start_s) % 60)).padStart(2, '0')}` : '') || '';
  }

  function structureMap(data = {}) {
    const groups = groupStoryboard(data);
    if (!groups.length) return '';
    return `<div class="bd-structure-grid">${groups.map(group => `<button type="button" class="bd-structure-card" data-bd-chapter="${group.index}">
      <span>${esc(group.section_id)}</span>
      <strong>${esc(group.title)}</strong>
      <small>${esc(group.in_tc || sectionTime(group))} → ${esc(group.out_tc || group.end_s || '')} · ${group.shots.length} 单元</small>
      <p>${esc(group.content || group.director_function || '')}</p>
    </button>`).join('')}</div>`;
  }

  function unitMedia(shot) {
    if (shot.frame_url) return `<img src="${esc(shot.frame_url)}" alt="${esc(shot.shot_id)} 关键帧" loading="lazy">`;
    if (shot.video_url) return `<video muted controls preload="metadata" playsinline src="${esc(shot.video_url)}#t=${Number(shot.start_s || 0).toFixed(2)}"></video>`;
    return `<div class="bd-frame-status"><b>文字拉片已完成</b><span>该单元未公开展示关键帧</span></div>`;
  }

  function unitCard(shot) {
    const unitId = shot.shot_id || 'UNIT';
    return `<details class="bd-unit" id="bd-unit-${safeDomId(unitId)}" data-bd-unit="${esc(unitId)}">
      <summary>
        <span class="bd-unit-code">${esc(shot.shot_id || 'UNIT')}</span>
        <span class="bd-unit-title"><strong>${esc(shot.title || shot.visual || '未命名单元')}</strong><small>${esc(shotTime(shot))}</small></span>
        <span class="bd-unit-preview">${esc(shot.visual || shot.director || '')}</span>
        <span class="bd-unit-open">详情</span>
      </summary>
      <div class="bd-unit-detail">
        <div class="bd-unit-media">${unitMedia(shot)}</div>
        <div class="bd-unit-fields">
          ${field('画面 / 内容', shot.visual)}
          ${field('摄影 / 构图', shot.camera)}
          ${field('排版', shot.layout)}
          ${field('运动 / 转场', shot.motion || shot.transition)}
          ${field('声音', shot.sound)}
          ${field('导演判断', shot.director)}
          ${field('可复用标签', shot.tags)}
        </div>
      </div>
    </details>`;
  }

  function mobileStepper(data, groups) {
    const steps = groups.flatMap(group => group.shots.map(shot => ({ group, shot })));
    if (!steps.length) return '';
    const defaultShotId = data.public_view?.mobile_default_shot || steps[0]?.shot?.shot_id;
    const defaultIndex = Math.max(0, steps.findIndex(({ shot }) => shot.shot_id === defaultShotId));
    const current = `${String(defaultIndex + 1).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')}`;
    const label = data.public_view?.mobile_label || `${steps.length} 帧学习路径`;
    return `<aside class="bd-mobile-stepper" data-bd-mobile-stepper data-bd-default-shot="${esc(data.public_view?.mobile_default_shot || steps[0]?.shot?.shot_id || '')}" aria-label="关键帧学习路径">
      <span class="bd-mobile-step-label">${esc(label)}</span>
      <strong data-bd-mobile-step-current>${current}</strong>
      <div class="bd-mobile-step-list" role="tablist" aria-label="关键帧目录">
        ${steps.map(({ shot }, index) => `<button type="button" data-bd-focus-unit="${esc(shot.shot_id || '')}" data-bd-step-index="${index}" aria-label="打开第 ${index + 1} 帧：${esc(shot.title || shot.visual || shot.shot_id || '关键帧')}">${String(index + 1).padStart(2, '0')}</button>`).join('')}
      </div>
    </aside>`;
  }

  function storyboardExplorer(data = {}) {
    const groups = groupStoryboard(data);
    const coverage = publicCoverage(data);
    const shots = data.storyboard || [];
    const mobileStepperEnabled = data.public_view?.mobile_layout === 'keyframe-stepper';
    if (!shots.length) return shotTable(shots);
    const groupMarkup = groups.map(group => `<details class="bd-section-group" id="bd-story-section-${group.index}" data-bd-section-group>
      <summary>
        <span class="bd-section-code">${esc(group.section_id)}</span>
        <span class="bd-section-heading"><strong>${esc(group.title)}</strong><small>${esc(group.in_tc || sectionTime(group))} → ${esc(group.out_tc || group.end_s || '')} · ${group.shots.length} 个视觉单元</small></span>
        <span class="bd-section-function">${esc(group.director_function || group.content || '')}</span>
        <span class="bd-summary-toggle">展开</span>
      </summary>
      <div class="bd-section-body">
        <div class="bd-section-brief"><b>本段内容</b><p>${esc(group.content || '')}</p></div>
        <div class="bd-unit-list">${group.shots.map(unitCard).join('')}</div>
      </div>
    </details>`).join('');
    const reader = mobileStepperEnabled
      ? `<div class="bd-mobile-reader">${mobileStepper(data, groups)}<div class="bd-section-groups">${groupMarkup}</div></div>`
      : `<div class="bd-section-groups">${groupMarkup}</div>`;
    return `<div class="bd-storyboard-explorer${mobileStepperEnabled ? ' is-mobile-stepper' : ''}">
      <div class="bd-explorer-summary">
        <div><span class="bd-reading-mode">${esc(coverage.mode)}</span><strong>${coverage.published} / ${coverage.total} 公开关键帧</strong><p>${esc(coverage.note)}</p></div>
        <div class="bd-explorer-actions"><button type="button" data-bd-expand-sections>展开段落</button><button type="button" data-bd-collapse-sections>收起段落</button></div>
      </div>
      <nav class="bd-chapter-nav" aria-label="影片段落目录">
        <span>片段目录</span>
        ${groups.map(group => `<button type="button" data-bd-chapter="${group.index}"><b>${esc(group.section_id)}</b><strong>${esc(group.title)}</strong><small>${esc(group.in_tc || sectionTime(group))} · ${group.shots.length} 单元</small></button>`).join('')}
      </nav>
      ${reader}
      <details class="bd-all-units">
        <summary><span>需要逐行复核？</span><strong>打开全部 ${shots.length} 个视觉单元的完整表格</strong><small>表格保留给检索和核对，不作为默认阅读方式。</small></summary>
        <div class="bd-all-units-body">${shotTable(shots)}</div>
      </details>
    </div>`;
  }

  function detailToc() {
    return `<nav class="bd-detail-toc" aria-label="本页目录">
      <span>阅读目录</span>
      <button type="button" data-bd-scroll="bd-judgement">核心判断</button>
      <button type="button" data-bd-scroll="bd-structure">片段结构</button>
      <button type="button" data-bd-scroll="bd-storyboard">分镜阅读</button>
      <button type="button" data-bd-scroll="bd-deep-dive">深入分析</button>
    </nav>`;
  }

  function foldableSection(id, eyebrow, title, description, body) {
    return `<section class="bd-section bd-foldable" id="${esc(id)}"><details>
      <summary><span><i class="bd-eyebrow">${esc(eyebrow)}</i><strong>${esc(title)}</strong><small>${esc(description)}</small></span><b>展开分析</b></summary>
      <div class="bd-foldable-body">${body}</div>
    </details></section>`;
  }

  function wireDetailNavigation() {
    root.querySelectorAll('[data-bd-scroll]').forEach(button => {
      button.addEventListener('click', () => root.querySelector(`#${button.dataset.bdScroll}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    });
    const mobileStepperRoot = root.querySelector('[data-bd-mobile-stepper]');
    const mobileUnits = mobileStepperRoot ? [...root.querySelectorAll('.bd-storyboard-explorer.is-mobile-stepper [data-bd-unit]')] : [];
    const mobileGroups = mobileStepperRoot ? [...root.querySelectorAll('.bd-storyboard-explorer.is-mobile-stepper [data-bd-section-group]')] : [];
    const isCompactViewport = () => window.matchMedia('(max-width: 700px)').matches;
    const revealMobileUnit = (shotId, shouldScroll = false) => {
      const activeUnit = mobileUnits.find(unit => unit.dataset.bdUnit === shotId);
      if (!activeUnit) return false;
      const activeGroup = activeUnit.closest('[data-bd-section-group]');
      mobileGroups.forEach(group => {
        const active = group === activeGroup;
        group.dataset.bdMobileActiveGroup = active ? 'true' : 'false';
        if (active) group.open = true;
      });
      mobileUnits.forEach(unit => {
        const active = unit === activeUnit;
        unit.dataset.bdMobileActive = active ? 'true' : 'false';
        if (active) unit.open = true;
      });
      const activeIndex = mobileUnits.indexOf(activeUnit);
      root.querySelectorAll('[data-bd-focus-unit]').forEach(button => {
        const active = button.dataset.bdFocusUnit === shotId;
        button.dataset.active = active ? 'true' : 'false';
        button.setAttribute('aria-current', active ? 'step' : 'false');
      });
      root.querySelectorAll('[data-bd-mobile-step-current]').forEach(label => {
        label.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(mobileUnits.length).padStart(2, '0')}`;
      });
      if (shouldScroll && isCompactViewport()) activeUnit.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return true;
    };
    const openChapter = (chapterIndex) => {
      const target = root.querySelector(`#bd-story-section-${chapterIndex}`);
      if (!target) return;
      const firstUnit = target.querySelector('[data-bd-unit]');
      if (firstUnit && revealMobileUnit(firstUnit.dataset.bdUnit, true)) return;
      target.open = true;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    root.querySelectorAll('[data-bd-chapter]').forEach(button => {
      button.addEventListener('click', () => openChapter(button.dataset.bdChapter));
    });
    root.querySelectorAll('[data-bd-focus-unit]').forEach(button => {
      button.addEventListener('click', () => revealMobileUnit(button.dataset.bdFocusUnit, true));
    });
    if (mobileUnits.length && isCompactViewport()) {
      const defaultShotId = root.querySelector('[data-bd-mobile-stepper]')?.dataset.bdDefaultShot;
      revealMobileUnit(defaultShotId || mobileUnits[0].dataset.bdUnit);
    }
    root.querySelector('[data-bd-expand-sections]')?.addEventListener('click', () => root.querySelectorAll('[data-bd-section-group]').forEach(group => { group.open = true; }));
    root.querySelector('[data-bd-collapse-sections]')?.addEventListener('click', () => root.querySelectorAll('[data-bd-section-group]').forEach(group => { group.open = false; }));
  }
  function motionAnatomy(items = []) {
    if (!items.length) return `<div class="bd-empty"><strong>Motion 参数尚未测量</strong><p>正式数据会记录 target、start/end frame、position / scale / opacity / blur / mask、easing、overshoot、stagger，以及这个动作在语义上为什么存在。</p></div>`;
    return storyboard(items.map(item => ({
      shot_id: item.motion_id,
      title: item.target,
      timecode: `${item.start_frame}f → ${item.end_frame}f`,
      visual: item.semantic_function,
      camera: item.properties ? JSON.stringify(item.properties) : '',
      motion: [item.easing, item.overshoot != null ? `overshoot ${item.overshoot}` : '', item.stagger_frames != null ? `stagger ${item.stagger_frames}f` : ''].filter(Boolean).join(' · '),
      director: item.learning || ''
    })));
  }

  async function renderDetail(slug) {
    loading('正在读取 Case 投影');
    try {
      const index = await getJSON(INDEX_URL);
      const item = (index.cases || []).find(entry => entry.slug === slug);
      if (!item) throw new Error('未找到对应 Case');
      const data = await getJSON(item.public_json);
      const motion = data.motion_anatomy || [];
      const sounds = data.sound_map || [];
      const patterns = data.patterns || [];
      const coverage = publicCoverage(data);
      root.innerHTML = `<section class="bd-page">
        <button class="bd-back" onclick="location.hash='breakdowns'">← 返回拉片库</button>
        <header class="bd-detail-hero">
          <div>
            <div class="bd-eyebrow">${esc(data.kicker)}</div>
            <span class="bd-status ${statusClass(data.status)}"><i></i>${esc(data.status_label)}</span>
            <h1>${esc(data.title)}</h1>
            <p class="bd-summary">${esc(data.intro)}</p>
            <div class="bd-public-state"><span>${esc(coverage.mode)}</span><strong>${coverage.published} / ${coverage.total} 公开关键帧</strong></div>
            ${tagList(item.tags)}
          </div>
          ${metaGrid(data)}
        </header>

        <div class="bd-gate"><b>当前事实边界</b><span>${esc(data.notice || '')}</span></div>
        ${detailToc()}

        <section class="bd-section" id="bd-judgement">
          <div class="bd-section-head"><div><div class="bd-eyebrow">DIRECTOR JUDGEMENT</div><h2>一句话看懂这条片</h2></div><p>${esc(data.one_line_judgement)}</p></div>
          ${learningGrid(data.why_learn || [])}
        </section>

        <section class="bd-section" id="bd-structure">
          <div class="bd-section-head"><div><div class="bd-eyebrow">NARRATIVE STRUCTURE</div><h2>整片结构</h2></div><p>段落不是简单按分钟切块，而是记录这一段让观众发生什么变化，以及画面和声音如何完成这个任务。</p></div>
          ${structureMap(data)}
        </section>

        <section class="bd-section" id="bd-storyboard">
          <div class="bd-section-head"><div><div class="bd-eyebrow">DIRECTOR STORYBOARD</div><h2>${esc(data.storyboard_label || `分段分镜 · ${(data.storyboard || []).length} 个视觉单元`)}</h2></div><p>${esc(data.storyboard_note || "先按段落理解叙事任务，再按需要展开镜头详情；没有通过公开门禁的关键帧不会伪装成图片。")}</p></div>
          ${storyboardExplorer(data)}
        </section>

        <div id="bd-deep-dive" class="bd-deep-dive">
          ${foldableSection('bd-timeline', 'MASTER TIMELINE', '全角色共享时间轴', '公开页显示理解层；内部每一个可执行事件都有 start_frame / end_frame，所有角色在同一坐标系协作。', trackMap(data.tracks || []))}
          ${foldableSection('bd-motion', 'MOTION ANATOMY', '动画为什么这样动', '重点不是动画名称，而是属性、曲线、速度和语义功能。Motion-to-Meaning 必须可以复刻。', motionAnatomy(motion))}
          ${foldableSection('bd-sound', 'SOUND MAP', '音乐与声音地图', '记录 BPM、段落功能、能量、onset、SFX、静默与画面事件的关系。', sounds.length ? storyboard(sounds) : `<div class="bd-empty"><strong>声音语义听审待执行</strong><p>母版音轨取得后才会确定 BPM / onset / phrase / SFX / silence。算法检测和导演听感会分开记录。</p></div>`)}
          ${foldableSection('bd-dna', 'TRANSFERABLE DNA', '真正可以带走的能力', '只有通过 QA 的 Pattern 才进入可迁移 DNA；每条规律都写明适用场景和边界条件。', patterns.length ? learningGrid(patterns) : `<div class="bd-empty"><strong>先复刻，再抽象</strong><p>AhaCreator 本案例坚持先做 1:1 重建和 A/B 差分，再从真实复刻结果反推出可迁移规律，避免把主观印象包装成“风格 DNA”。</p></div>`)}
        </div>
      </section>`;
      wireDetailNavigation();
    } catch (error) {
      errorView(error);
    }
  }

  function renderBreakdownRoute() {
    const hash = location.hash.slice(1);
    if (hash === 'breakdowns') {
      renderLibrary();
      return true;
    }
    if (hash.startsWith('breakdown/')) {
      renderDetail(hash.split('/')[1]);
      return true;
    }
    return false;
  }

  window.addEventListener('hashchange', () => {
    window.setTimeout(renderBreakdownRoute, 0);
  });

  renderBreakdownRoute();
})();