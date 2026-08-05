const root = document.querySelector('#app');

const categories = {
  software: { label: '软件', eyebrow: 'DOWNLOADABLE SOFTWARE', description: '可以下载、安装到电脑上使用的独立产品。每个软件都有自己的详情页、安装提示和下载入口。' },
  application: { label: '应用', eyebrow: 'BROWSER / LOCAL APPS', description: '可以直接打开使用的浏览器或手机端应用。当前目录会明确区分“本地可用”和“已公开入口”。' },
  service: { label: '服务', eyebrow: 'ONLINE SERVICES', description: '面向客户提供的线上服务或服务入口。尚未公开的服务会保留在目录中，但不会显示未经验证的链接。' }
};

const projects = {
  'intelligent-editing': { id: 'intelligent-editing', name: '智能剪辑', kicker: 'LOCAL CREATION TOOLKIT', status: '2 款软件 · 8 个案例', description: '把素材、脚本和声音变成可观看、可复用、可交付的成片。工具负责能力，案例负责证明，内部参考单独归档。', items: ['asr', 'audio'], cases: ['waterproofing', 'sony', 'ebay', 'congee', 'dumpling'], references: ['ikea', 'zhongxuegao', 'pujiang'] },
  'photography-workflow': { id: 'photography-workflow', name: '摄影获客工作流', kicker: 'PHOTOGRAPHY / LEAD FLOW', status: '本地应用待公开', description: '把摄影服务、公开线索研究和人工跟进整理在一个可审计的本地工作流中。公开服务入口仍在整理。', items: ['photography-app', 'photography-service'] }
};

const caseMediaRoot = 'https://preview.oing.xin/preview/ai-video-edit-case/';
const caseStudies = {
  waterproofing: { id: 'waterproofing', code: 'CASE_003 / TALKING HEAD', title: '卫生间防水验收｜Xiaoxi 有声终版', source: '9:16 · 33 秒', status: '已验证', statusClass: 'verified', video: 'assets/cases/CASE_003_卫生间防水验收_Xiaoxi有声网页.mp4', note: '把装修验收知识压缩成适合口播的竖屏成片：信息清晰、人物安全区保留、字幕与声音同步。本版使用 ElevenLabs_Xiaoxi（年轻友好女）。', tags: ['知识口播', '字幕导演', 'Xiaoxi配音'], category: '知识口播', outcome: '口播 + 字幕', role: '字幕导演', proof: ['33 秒', '中文口播', '三层字幕', '人物安全区', 'Xiaoxi配音'] },
  sony: { id: 'sony', code: 'CASE_0004 / SONY', title: 'Sony · 光影—手艺—技术', source: '168.69 秒 → 32.52 秒', status: '条件验收', statusClass: 'conditional', video: 'media/sony-recut-subtitled.mp4', note: '保留连续声音骨架，以少量关键镜头完成叙事压缩。', tags: ['品牌叙事', 'J/L-cut', '声音骨架'], category: '品牌叙事', outcome: '品牌片 / 技术', role: '剪辑师', proof: ['32 秒', '声音骨架', '镜头压缩', '条件验收'] },
  ebay: { id: 'ebay', code: 'CASE_0001 / EBAY', title: 'eBay · Reality to Proof', source: '60.12 秒 → 22.3 秒', status: '本地解码通过', statusClass: 'verified', video: 'media/works/EBAY_REALITY_TO_PROOF_v0.1.mp4', note: '高速虚假信息进入运动归零，再落到可信鉴定证明。', tags: ['广告节奏', '运动归零', '证明落点'], category: '广告节奏', outcome: '产品说明 / 教程', role: '剪辑师', proof: ['22 秒', '运动归零', '证明落点', '已验证'] },
  congee: { id: 'congee', code: 'CASE_0002 / 粥 TVC', title: '粥 TVC · 三速呼吸', source: '159.04 秒 → 43 秒', status: '本地解码通过', statusClass: 'verified', video: 'media/works/CONGEE_THREE_SPEED_v0.1.mp4', note: '把田野呼吸、食材爆发与情感锚点交替编排。', tags: ['广告节奏', '三速节奏', '动作优先'], category: '广告节奏', outcome: '广告 / 食品', role: '剪辑师', proof: ['43 秒', '三速节奏', '动作优先', '已验证'] },
  dumpling: { id: 'dumpling', code: 'CASE_0003 / DUMPLING', title: '饺子 TVC · 史诗到日常', source: '109.04 秒 → 41 秒', status: '本地解码通过', statusClass: 'verified', video: 'media/works/DUMPLING_EPIC_TO_EASY_v0.1.mp4', note: '先建立理想标准，再用家庭痛点把产品变成更聪明的答案。', tags: ['品牌叙事', '人物弧线', '产品答案'], category: '品牌叙事', outcome: '广告 / 食品', role: '剪辑师', proof: ['41 秒', '人物弧线', '产品答案', '已验证'] },
  ikea: { id: 'ikea', code: 'EAGLE / IKEA', title: 'IKEA · Order from Mess', source: 'Eagle 来源 · 23.04 秒', status: '内部参考 · 权利待核', statusClass: 'conditional', video: 'media/works/IKEA_SQUIRREL_ORDER_FROM_MESS_v0.1.mp4', note: '问题字幕、角色反应、混乱空间与品牌解决方案形成闭环。', tags: ['问题建立', '喜剧反应', '品牌落点'], internal: true, category: '品牌叙事' },
  zhongxuegao: { id: 'zhongxuegao', code: 'EAGLE / 钟薛高', title: '钟薛高 · Material to Gold', source: 'Eagle 来源 · 33.36 秒', status: '内部参考 · 权利待核', statusClass: 'conditional', video: 'media/works/ZHONGXUEGAO_MATERIAL_TO_GOLD_v0.1.mp4', note: '乳白材质、色彩转折与金色产品英雄逐层升温。', tags: ['材质叙事', '色彩转折', '产品英雄'], internal: true, category: '广告节奏' },
  pujiang: { id: 'pujiang', code: 'EAGLE / 浦江荟', title: '浦江荟 · Taste as Cinema', source: 'Eagle 来源 · 43.96 秒', status: '内部参考 · 权利待核', statusClass: 'conditional', video: 'media/works/PUJIANG_TASTE_AS_CINEMA_v0.1.mp4', note: '刀工、火焰与摆盘把餐饮片剪成一段触觉电影。', tags: ['触觉拟音位', '火焰爆发', '主理人收束'], internal: true, category: '广告节奏' }
};

const items = {
  asr: {
    id: 'asr', type: 'software', project: 'intelligent-editing', name: '声听 Local ASR', kicker: '语音转文字 · 粤语优先', icon: 'assets/shengting-local-asr-icon-1024.png', status: '公开试用', statusClass: '',
    intro: '把录音、采访和视频里的声音，快速变成可检索、可复制的文字。模型与音频留在本机，适合粤语、普通话和日常素材整理。', downloadUrl: 'https://pan.baidu.com/s/1q8WLo23vE5Atz5L-y1O7jw?pwd=8247', downloadCode: '8247',
    features: ['支持音频上传、拖拽、麦克风录音与本地路径转写', 'SenseVoice Small + FSMN VAD 本地模型，支持粤语 yue', '提供 Web、HTTP/OpenAPI、MCP 与桌面启动入口', '真实粤语上传转写与本机验收已通过'], facts: [['公开状态', '公开试用'], ['适合平台', 'macOS'], ['处理方式', '本地 CPU'], ['首次使用', '安装 Python 依赖']], install: '下载后，首次运行“首次安装并启动”；以后双击声听 Local ASR.app。若系统拦截，请右键选择“打开”。', technology: ['Python · FastAPI · Uvicorn', 'FunASR · ModelScope · PyTorch', 'SenseVoice Small · FSMN VAD', 'FFmpeg · MCP'], notices: ['FunASR 代码：MIT（上游）', 'SenseVoice Small / FSMN VAD：请遵循各自模型卡许可与署名要求', 'FFmpeg：按实际安装或捆绑方式履行 LGPL/GPL 等上游许可']
  },
  audio: {
    id: 'audio', type: 'software', project: 'intelligent-editing', name: 'Audio Toolbox Studio', kicker: '音乐节奏与时长处理', icon: 'assets/audio-toolbox-icon.png', status: '公开 Beta', statusClass: 'beta',
    intro: '把音乐和音频素材做短、做得更有节奏，并在同一个本地工作台里完成分离、混音、响度分析与批量交付。可按目标秒数处理，适合短视频、播客和后期预览。', downloadUrl: 'https://pan.baidu.com/s/1rO4aVUuUVjqqx4xJssng9g?pwd=8248', downloadCode: '8248',
    features: ['输入音乐后选择目标时长，生成短版节奏预览', '支持变调/换声线、快速分离、多轨混音与批处理队列', '输出前检查时长、采样率、响度、峰值和削波风险', 'DSP-first：不把未验证的 RVC/UVR 能力包装成已交付 AI'], facts: [['公开状态', 'Apple Silicon Beta'], ['安装包', 'macOS DMG'], ['处理方式', '本地 DSP-first'], ['安全提示', '未完成签名/公证']], install: '下载 DMG 后拖入 Applications。当前是公开 Beta：macOS 可能提示未验证开发者；仅建议愿意参与测试的 Apple Silicon 用户安装。', technology: ['React · TypeScript · Vite', 'Tauri · Rust · Python FastAPI', 'librosa · soundfile · PyTorch', 'FFmpeg · SQLite · Eagle 工作流'], notices: ['React、Tauri、FastAPI 等组件按其各自开源许可证使用', 'FFmpeg：按实际安装或捆绑方式履行 LGPL/GPL 等上游许可', '真实 RVC/UVR/Zero-shot 推理未作为本 Beta 的公开交付能力']
  },
  'photography-app': {
    id: 'photography-app', type: 'application', project: 'photography-workflow', name: '产品摄影获客中心', kicker: '本地浏览器应用', icon: null, status: '本地应用 · 待公开', statusClass: 'muted',
    intro: '面向产品摄影业务的线索整理与跟进工作台：导入公开线索、记录证据、生成英文触达草稿，并保留人工确认边界。', features: ['公开线索 CSV 导入、筛选和详情查看', '英文触达草稿、回复/任务导入与跟进提醒草稿', '公开 RSS 发现和研究任务；公开信号不等于客户订单', '仅打开 mailto，由操作者人工确认后发送，不自动外发'], facts: [['使用方式', '浏览器打开'], ['当前状态', '本地应用'], ['数据边界', '本机优先'], ['公开入口', '待整理']], install: '当前版本是本地浏览器应用，尚未提供公网入口或客户数据。等公开部署、隐私边界和作品版权清单完成后，再发布公开访问链接。', technology: ['HTML · CSS · JavaScript', 'Node.js 本地服务', 'CSV · RSS · 审计记录', 'AI 改写通过环境变量配置'], notices: ['不会把本机路径、线索数据或联系人信息放进公开站点', '自动外发、自动承诺和未授权作品上传不属于当前能力', '本页面只展示产品定位，不代表已经提供公网服务']
  },
  'photography-service': {
    id: 'photography-service', type: 'service', project: 'photography-workflow', name: '产品摄影内容服务', kicker: '摄影内容 · 获客支持', icon: null, status: '服务入口待整理', statusClass: 'muted',
    intro: '围绕产品摄影、内容素材和获客支持提供的服务方向。服务内容可以先在项目页归档，公开报价与联系入口待确认后再上线。', features: ['产品摄影内容策划与素材整理', '面向客户需求的案例与作品证据归档', '线索研究和人工跟进流程支持', '服务范围、报价、交付周期待公开确认'], facts: [['服务状态', '待公开'], ['公开链接', '暂未验证'], ['交付方式', '人工确认'], ['所属项目', '摄影获客工作流']], install: '当前没有公开下单或自动联系入口。这里先作为服务目录占位，避免把本地工具误写成已经在线运营的服务。', technology: ['本地线索研究工作流', '作品证据与版权状态记录', '人工确认的邮件触达流程'], notices: ['服务页不会展示未经授权的客户数据或作品', '公开入口、价格和服务承诺需要另行确认后再发布']
  }
};

function icon(item, cls = 'icon') { return item.icon ? `<img class="${cls}" src="${item.icon}" alt="${item.name} 图标">` : `<div class="${cls} icon-fallback" aria-hidden="true">${item.type === 'service' ? '↗' : '◎'}</div>`; }
function list(values) { return `<ul>${values.map(value => `<li>${value}</li>`).join('')}</ul>`; }
function routeForItem(item) { return `item/${item.id}`; }
function itemCard(item) { return `<article class="card" data-route="${routeForItem(item)}"><div class="card-top">${icon(item)}<span class="status ${item.statusClass || ''}">${item.status}</span></div><h3>${item.name}</h3><p>${item.intro}</p><div class="card-bottom"><span>${item.kicker}</span><span class="arrow">↗</span></div></article>`; }
function categoryCard(type) { const category = categories[type]; const count = Object.values(items).filter(item => item.type === type).length; return `<article class="axis-card" data-route="category/${type}"><div class="axis-number">0${Object.keys(categories).indexOf(type) + 1}</div><div><div class="eyebrow">${category.eyebrow}</div><h3>${category.label}</h3><p>${category.description}</p></div><span class="axis-meta">${count ? `${count} 项` : '待整理'} ↗</span></article>`; }
function projectCard(project) { return `<article class="project-card" data-route="project/${project.id}"><div class="project-top"><span class="project-index">PROJECT / ${project.id === 'intelligent-editing' ? '01' : '02'}</span><span class="status">${project.status}</span></div><h3>${project.name}</h3><p>${project.description}</p><div class="project-bottom"><span>${project.items.length} 个目录项</span><span class="arrow">↗</span></div></article>`; }
function mediaUrl(study) { return study.video.startsWith('http') || study.video.startsWith('assets/') ? study.video : `${caseMediaRoot}${study.video}`; }
function proofItems(study) {
  const labels = ['成片时长', '语言与声音', '字幕系统', '人物安全区', '发布状态'];
  const fallback = [study.source, study.category, study.outcome || '结构化字幕', '人物安全区', '结果可回看'];
  const values = [...(study.proof || fallback)];
  while (values.length < labels.length) values.push(fallback[values.length] || '已留档');
  return values.slice(0, labels.length).map((item, index) => `<div class="proof-item"><span class="proof-count">0${index + 1}</span><strong>${item}</strong><small>${labels[index]}</small></div>`).join('');
}
function caseRow(study, index) {
  return `<article class="deliverable-row ${index === 0 ? 'active' : ''}" data-case-row="${study.id}">
    <button class="deliverable-preview inline-player" type="button" data-inline-play="${study.id}" aria-label="直接播放：${study.title}">
      <video class="inline-video" preload="metadata" playsinline><source src="${mediaUrl(study)}#t=0.5" type="video/mp4" /></video>
      <span class="preview-label">▶ 点击播放</span>
    </button>
    <button class="deliverable-select" type="button" data-case="${study.id}" aria-label="在主播放器查看案例：${study.title}">
      <span class="deliverable-index">0${index + 1}</span>
      <span class="deliverable-main"><strong>${study.title}</strong><small>${study.category}　·　${study.outcome || study.tags.slice(0, 2).join(' / ')}</small></span>
      <span class="deliverable-meta"><small>${study.source}</small><em class="case-status ${study.statusClass}">${study.status}</em></span>
    </button>
  </article>`;
}
function caseGroup(title, english, studies, offset = 0) {
  if (!studies.length) return '';
  return `<div class="case-group"><div class="case-group-head"><div><strong>${title}</strong><small>${english}</small></div><span>${studies.length} 个案例</span></div><div class="deliverable-list">${studies.map((study, index) => caseRow(study, index + offset)).join('')}</div></div>`;
}
function referenceRow(study) { return `<div class="reference-row"><span class="reference-index">REF</span><span><strong>${study.title}</strong><small>${study.source} · ${study.tags.slice(0, 2).join(' / ')}</small></span><em>${study.status}</em></div>`; }
function capabilityRow(index, title, tool, description, output) {
  return `<details class="capability-row" ${index === '01' ? 'open' : ''}><summary><span class="capability-index">${index}</span><span class="capability-title"><strong>${title}</strong><small>${tool}</small></span><span class="capability-description">${description}</span><span class="capability-output">${output}</span><span class="capability-toggle" aria-hidden="true">⌄</span></summary><div class="capability-detail"><span>这一层解决什么</span><p>${description}</p><span>可回查产出</span><p>${output}</p></div></details>`;
}
function caseSection(project) {
  const studies = project.cases.map(id => caseStudies[id]).filter(Boolean);
  const references = (project.references || []).map(id => caseStudies[id]).filter(Boolean);
  const talkStudies = studies.filter(study => study.category === '知识口播');
  const brandStudies = studies.filter(study => study.category !== '知识口播');
  const first = talkStudies[0] || studies[0];

  return `<section class="case-section intelligent-showcase" id="case-showcase">
    <div class="showcase-hero">
      <div class="showcase-intro">
        <div class="eyebrow">OING · INTELLIGENT EDITING</div>
        <h1>智能剪辑</h1>
        <p>把素材与脚本，智能变成可看、可用的成片。</p>
        <small>理解素材、编排节奏、处理字幕与声音，再把结果交付到真实场景里。</small>
        <a class="text-link showcase-link" href="#capabilities">了解制作方式　→</a>
        <div class="showcase-method"><span>从文本到成片</span><strong>判断 · 编排 · 配音 · 字幕 · 交付</strong></div>
      </div>
      <div class="featured-video">
        <div class="featured-overlay">
          <span class="case-status ${first.statusClass}" id="case-status">${first.status}</span>
          <span class="featured-code" id="case-code">${first.code}</span>
          <h2 id="case-title">${first.title}</h2>
          <p id="case-note">${first.note}</p>
          <span class="featured-role" id="case-role">${first.role || '智能剪辑'}</span>
        </div>
        <video id="case-player" controls preload="metadata" playsinline><source src="${mediaUrl(first)}" type="video/mp4" /></video>
      </div>
    </div>

    <div class="proof-strip" id="case-proof">${proofItems(first)}</div>

    <section class="capability-section" id="capabilities">
      <div class="section-label"><div><div class="eyebrow">PRODUCTION SYSTEM</div><h2>制作能力</h2></div><span>目标明确的自动化生产链</span></div>
      <div class="capability-list">
        ${capabilityRow('01', '文本与声音理解', '声听 Local ASR', '识别口播、环境声与音乐，定位关键信息和节奏锚点。', '结构化文字 / 关键词 / 时间轴标注')}
        ${capabilityRow('02', '导演编排', 'Director Brain + Audio Toolbox', '基于受众、传播目的与内容密度组织镜头、字幕、音乐与配音。', '镜头顺序 / 节奏结构 / 配音与字幕')}
        ${capabilityRow('03', '交付与版本', '智能导出', '输出适合不同平台与人物安全区的版本，保留可回查的工程证据。', '成片 / 多版本 / 字幕文件 / 验收报告')}
      </div>
    </section>

    <section class="deliverable-section">
      <div class="section-label"><div><div class="eyebrow">SELECTED OUTPUTS</div><h2>按使用场景的成片</h2></div><span>先看结果，再看方法</span></div>
      <p class="deliverable-intro">把知识口播、品牌叙事和广告节奏分开陈列，避免不同目的的案例混在一起；所有历史案例仍然保留。</p>
      ${caseGroup('知识口播', 'KNOWLEDGE TALK', talkStudies)}
      ${caseGroup('品牌叙事与广告节奏', 'BRAND / COMMERCIAL', brandStudies, talkStudies.length)}
    </section>

    ${references.length ? `<section class="reference-section"><div class="section-label"><div><div class="eyebrow">RESEARCH MATERIAL</div><h2>内部学习参考 <em>（不用于对外案例）</em></h2></div><span>仅供内部学习与方法沉淀</span></div><p class="reference-note">这些素材用于训练导演判断与剪辑方法，不代表 OING 的公开交付案例。</p><div class="reference-list">${references.map(referenceRow).join('')}</div></section>` : ''}
  </section>`;
}
function home() { const publicSoftware = Object.values(items).filter(item => item.type === 'software'); return `<section class="hero-grid"><div><div class="eyebrow">APPLICATION CENTER / 01</div><h1>按分类找，<em>按项目用。</em></h1><p class="intro">这里是我们的产品入口：可以下载的软件、可以直接使用的应用，以及面向客户的服务。分类从主页开始，进入具体项目后，还能看到属于这个项目的全部产品。</p><div class="hero-actions"><button class="cta" data-route="category/software">浏览软件 ↗</button><button class="cta secondary" data-route="project/intelligent-editing">查看智能剪辑项目</button></div></div><div class="hero-art"><span class="art-label">SOFTWARE / APPS / SERVICES</span><div class="signal">${Array.from({length: 34}, (_, i) => `<span style="height:${25 + ((i * 31) % 75)}%"></span>`).join('')}</div></div></section><section class="axis-section"><div class="section-head"><div><div class="eyebrow">按分类</div><h2>先找到你要的形态</h2></div><span>三种入口</span></div><div class="axis-grid">${Object.keys(categories).map(categoryCard).join('')}</div></section><section><div class="section-head"><div><div class="eyebrow">按项目</div><h2>从项目进入产品</h2></div><span>${Object.keys(projects).length} 个项目</span></div><div class="project-grid">${Object.values(projects).map(projectCard).join('')}</div></section><section><div class="section-head"><div><div class="eyebrow">软件 / 已公开</div><h2>智能剪辑的两款软件</h2></div><button class="text-link" data-route="project/intelligent-editing">进入项目页 ↗</button></div><section class="cards">${publicSoftware.map(itemCard).join('')}</section></section>`; }
function categoryPage(type) { const category = categories[type]; const entries = Object.values(items).filter(item => item.type === type); return `<section><div class="eyebrow">${category.eyebrow}</div><h1>${category.label}</h1><p class="intro">${category.description}</p><div class="section-head"><div><div class="eyebrow">目录状态</div><h2>${entries.length ? `当前 ${category.label}` : '公开入口待整理'}</h2></div><span>${entries.length ? `${entries.length} 项` : '暂无公开项目'}</span></div>${entries.length ? `<section class="cards">${entries.map(itemCard).join('')}</section>` : '<div class="empty">目前没有已经验证的公开入口。后续会在确认部署、版权、隐私和服务边界后补充。</div>'}</section>`; }
function projectPage(project) { const entries = project.items.map(id => items[id]).filter(Boolean); if (project.id === 'intelligent-editing') { return `<section class="editing-project-page"><button class="detail-back" data-route="home">← 返回 OING 主页</button>${caseSection(project)}<section class="tool-appendix"><div class="section-label"><div><div class="eyebrow">TOOLS / DOWNLOADS</div><h2>支持模块</h2></div><span>独立详情与下载</span></div><section class="cards">${entries.map(itemCard).join('')}</section><div class="project-note">工具负责具体能力，案例负责展示结果；同一个软件只维护一个独立详情与下载入口。</div></section></section>`; } const showcase = project.cases ? caseSection(project) : ''; return `<section><button class="detail-back" data-route="home">← 返回应用主页</button><div class="project-hero"><div><div class="eyebrow">${project.kicker}</div><h1>${project.name}</h1><p class="intro">${project.description}</p></div><div class="project-stamp"><span>${project.status}</span><strong>${entries.length}</strong><small>工具目录项</small></div></div><div class="section-head"><div><div class="eyebrow">项目内工具</div><h2>这个项目包含</h2></div><span>分类仍然保留</span></div><section class="cards">${entries.map(itemCard).join('')}</section><div class="project-note">项目页负责聚合工具与案例，分类页负责横向浏览；同一个软件只维护一个详情和一个独立下载入口。</div>${showcase}</section>`; }
function oss() { return `<section><div class="eyebrow">OPEN SOURCE / NOTICE</div><h1>开源与许可</h1><p class="intro">需要声明。我们使用了开源框架与模型；自有代码、第三方代码、模型权重和可下载发布包不是同一件事。</p><div class="detail-grid"><div class="panel"><h2>本站与软件代码</h2><p>本站页面代码以 MIT License 发布。两个软件当前公开的是下载入口；源码会在完成脱敏、第三方许可证清单和 NOTICE 后拆分发布。</p><p>不会把模型缓存、用户音频、Eagle 素材、日志、发布证据、签名记录或运行数据库提交到公开仓库。</p></div><div class="panel"><h2>核心上游组件</h2>${list(['声听：FastAPI、FunASR、ModelScope、PyTorch、FFmpeg、MCP', '音频工作台：React、Tauri、Rust、FastAPI、librosa、soundfile、PyTorch、FFmpeg、SQLite', '模型权重遵循其模型卡或权利声明；不因软件源码开源而自动改变模型许可'])}<p class="note">完整依赖清单与 NOTICE 会随对应源码仓库发布；当前页面不把“使用开源组件”误写成“所有模型可自由再分发”。</p></div></div></section>`; }
function detail(item) { const download = item.downloadUrl ? `<a class="cta" href="${item.downloadUrl}" target="_blank" rel="noopener">下载 ${item.name} ↗</a><div class="note">本软件独立提取码：${item.downloadCode} · 下载即表示你理解当前公开测试状态。</div>` : `<div class="empty inline-empty">当前没有公网下载或访问链接。状态：${item.status}。</div>`; return `<section class="detail"><button class="detail-back" data-route="category/${item.type}">← 返回${categories[item.type].label}</button><div class="detail-head">${icon(item, 'detail-icon')}<div><div class="eyebrow">${item.kicker}</div><h1>${item.name}</h1><p class="detail-sub">${item.intro}</p></div></div><div class="detail-grid"><div class="panel"><h2>它能做什么</h2>${list(item.features)}<h2>技术与开源组件</h2>${list(item.technology)}<h2>声明</h2>${list(item.notices)}</div><div class="panel"><h2>${item.type === 'software' ? '安装与使用' : '当前状态'}</h2><div class="facts">${item.facts.map(([key, value]) => `<div class="fact"><small>${key}</small><strong>${value}</strong></div>`).join('')}</div><p>${item.install}</p>${download}<button class="cta secondary" data-route="oss">查看开源与许可</button></div></div></section>`; }
function render() { const hash = location.hash.slice(1) || 'project/intelligent-editing'; let html = projectPage(projects['intelligent-editing']); let active = 'project'; if (hash === 'software') { location.hash = 'category/software'; return; } if (hash === 'oss') { html = oss(); active = 'oss'; } else if (hash.startsWith('category/')) { const type = hash.split('/')[1]; if (categories[type]) { html = categoryPage(type); active = type; } } else if (hash.startsWith('project/')) { const project = projects[hash.split('/')[1]]; if (project) { html = projectPage(project); active = 'project'; } } else if (hash.startsWith('item/') || hash.startsWith('app/')) { const item = items[hash.split('/')[1]]; if (item) { html = detail(item); active = item.type; } } root.innerHTML = html; document.querySelectorAll('[data-route]').forEach(element => element.addEventListener('click', () => { location.hash = element.dataset.route; })); document.querySelectorAll('[data-inline-play]').forEach(control => { const video = control.querySelector('video'); const label = control.querySelector('.preview-label'); if (!video || !label) return; const sync = () => { const playing = !video.paused && !video.ended; control.classList.toggle('is-playing', playing); label.textContent = playing ? 'Ⅱ 点击暂停' : '▶ 点击播放'; }; video.addEventListener('play', sync); video.addEventListener('pause', sync); video.addEventListener('ended', sync); control.addEventListener('click', () => { document.querySelectorAll('.inline-video').forEach(other => { if (other !== video) other.pause(); }); if (video.paused || video.ended) { video.play().catch(() => { label.textContent = '无法播放'; }); } else { video.pause(); } }); }); document.querySelectorAll('[data-case]').forEach(element => element.addEventListener('click', () => { const study = caseStudies[element.dataset.case]; const player = document.querySelector('#case-player'); if (!study || !player) return; player.src = mediaUrl(study); player.load(); document.querySelector('#case-title').textContent = study.title; document.querySelector('#case-note').textContent = study.note; const code = document.querySelector('#case-code'); if (code) code.textContent = study.code; const role = document.querySelector('#case-role'); if (role) role.textContent = study.role || '智能剪辑'; const status = document.querySelector('#case-status'); status.textContent = study.status; status.className = `case-status ${study.statusClass}`; const proof = document.querySelector('#case-proof'); if (proof) proof.innerHTML = proofItems(study); document.querySelectorAll('[data-case-row]').forEach(card => card.classList.toggle('active', card.dataset.caseRow === study.id)); })); document.querySelectorAll('.topbar nav button').forEach(element => element.classList.toggle('active', (element.dataset.nav || element.dataset.route) === active)); root.focus(); }

window.addEventListener('hashchange', render);
render();
