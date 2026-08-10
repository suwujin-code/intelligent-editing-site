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
      root.innerHTML = `<section class="bd-page">
        <button class="bd-back" onclick="location.hash='breakdowns'">← 返回拉片库</button>
        <header class="bd-detail-hero">
          <div>
            <div class="bd-eyebrow">${esc(data.kicker)}</div>
            <span class="bd-status ${statusClass(data.status)}"><i></i>${esc(data.status_label)}</span>
            <h1>${esc(data.title)}</h1>
            <p class="bd-summary">${esc(data.intro)}</p>
            ${tagList(item.tags)}
          </div>
          ${metaGrid(data)}
        </header>

        <div class="bd-gate"><b>当前事实边界</b><span>${esc(data.notice || '')}</span></div>

        <section class="bd-section">
          <div class="bd-section-head"><div><div class="bd-eyebrow">DIRECTOR JUDGEMENT</div><h2>一句话看懂这条片</h2></div><p>${esc(data.one_line_judgement)}</p></div>
          ${learningGrid(data.why_learn || [])}
        </section>

        <section class="bd-section">
          <div class="bd-section-head"><div><div class="bd-eyebrow">MASTER TIMELINE</div><h2>全角色共享时间轴</h2></div><p>公开页显示理解层；内部每一个可执行事件都有 start_frame / end_frame，Director、Editor、Art、Sound 在同一个坐标系里协作。</p></div>
          ${trackMap(data.tracks || [])}
        </section>

        <section class="bd-section">
          <div class="bd-section-head"><div><div class="bd-eyebrow">NARRATIVE STRUCTURE</div><h2>整片结构</h2></div><p>段落不是简单按分钟切块，而是记录这一段让观众发生什么变化，以及画面和声音如何完成这个任务。</p></div>
          ${sectionTable(data.sections || [])}
        </section>

        <section class="bd-section">
          <div class="bd-section-head"><div><div class="bd-eyebrow">DIRECTOR STORYBOARD</div><h2>关键分镜表</h2></div><p>公开展示关键镜头簇；内部保留全部编辑单元与精确 Cut Index，避免教学视图和机器执行互相绑死。</p></div>
          ${storyboard(data.storyboard || [])}
        </section>

        <section class="bd-section">
          <div class="bd-section-head"><div><div class="bd-eyebrow">MOTION ANATOMY</div><h2>动画为什么这样动</h2></div><p>重点不是动画名称，而是属性、曲线、速度和语义功能。Motion-to-Meaning 必须可以复刻。</p></div>
          ${motionAnatomy(motion)}
        </section>

        <section class="bd-section">
          <div class="bd-section-head"><div><div class="bd-eyebrow">SOUND MAP</div><h2>音乐与声音地图</h2></div><p>不仅记录 BPM；还记录段落功能、能量、phrase boundary、onset、SFX、静默与画面事件的关系。</p></div>
          ${sounds.length ? storyboard(sounds) : `<div class="bd-empty"><strong>声音语义听审待执行</strong><p>母版音轨取得后才会确定 BPM / onset / phrase / SFX / silence。算法检测和导演听感会分开记录。</p></div>`}
        </section>

        <section class="bd-section">
          <div class="bd-section-head"><div><div class="bd-eyebrow">TRANSFERABLE DNA</div><h2>真正可以带走的能力</h2></div><p>只有通过 QA 的 Pattern 才进入可迁移 DNA；每条规律都写明适用场景和边界条件。</p></div>
          ${patterns.length ? learningGrid(patterns) : `<div class="bd-empty"><strong>先复刻，再抽象</strong><p>AhaCreator 本案例坚持先做 1:1 重建和 A/B 差分，再从真实复刻结果反推出可迁移规律，避免把主观印象包装成“风格 DNA”。</p></div>`}
        </section>
      </section>`;
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
