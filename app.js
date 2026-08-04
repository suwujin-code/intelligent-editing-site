const root = document.querySelector('#app');
const apps = {
  asr: {
    id: 'asr', name: '声听 Local ASR', kicker: '语音转文字 · 粤语优先', icon: 'assets/shengting-local-asr-icon-1024.png', status: '公开试用', statusClass: '',
    intro: '把录音、采访和视频里的声音，快速变成可检索、可复制的文字。模型与音频留在本机，适合粤语、普通话和日常素材整理。', downloadUrl: 'https://pan.baidu.com/s/1q8WLo23vE5Atz5L-y1O7jw?pwd=8247', downloadCode: '8247',
    features: ['支持音频上传、拖拽、麦克风录音与本地路径转写', 'SenseVoice Small + FSMN VAD 本地模型，支持粤语 yue', '提供 Web、HTTP/OpenAPI、MCP 与桌面启动入口', '真实粤语上传转写与本机验收已通过'],
    facts: [['公开状态','公开试用'],['适合平台','macOS'],['处理方式','本地 CPU'],['首次使用','安装 Python 依赖']],
    install: '下载后，首次运行“首次安装并启动”；以后双击声听 Local ASR.app。若系统拦截，请右键选择“打开”。',
    technology: ['Python · FastAPI · Uvicorn', 'FunASR · ModelScope · PyTorch', 'SenseVoice Small · FSMN VAD', 'FFmpeg · MCP'],
    notices: ['FunASR 代码：MIT（上游）', 'SenseVoice Small / FSMN VAD：请遵循各自模型卡许可与署名要求', 'FFmpeg：按实际安装或捆绑方式履行 LGPL/GPL 等上游许可']
  },
  audio: {
    id: 'audio', name: 'Audio Toolbox Studio', kicker: '音乐节奏与时长处理', icon: 'assets/audio-toolbox-icon.png', status: '公开 Beta', statusClass: 'beta',
    intro: '把音乐和音频素材做短、做得更有节奏，并在同一个本地工作台里完成分离、混音、响度分析与批量交付。可按目标秒数处理，适合短视频、播客和后期预览。', downloadUrl: 'https://pan.baidu.com/s/1rO4aVUuUVjqqx4xJssng9g?pwd=8248', downloadCode: '8248',
    features: ['输入音乐后选择目标时长，生成短版节奏预览', '支持变调/换声线、快速分离、多轨混音与批处理队列', '输出前检查时长、采样率、响度、峰值和削波风险', 'DSP-first：不把未验证的 RVC/UVR 能力包装成已交付 AI'],
    facts: [['公开状态','Apple Silicon Beta'],['安装包','macOS DMG'],['处理方式','本地 DSP-first'],['安全提示','未完成签名/公证']],
    install: '下载 DMG 后拖入 Applications。当前是公开 Beta：macOS 可能提示未验证开发者；仅建议愿意参与测试的 Apple Silicon 用户安装。',
    technology: ['React · TypeScript · Vite', 'Tauri · Rust · Python FastAPI', 'librosa · soundfile · PyTorch', 'FFmpeg · SQLite · Eagle 工作流'],
    notices: ['React、Tauri、FastAPI 等组件按其各自开源许可证使用', 'FFmpeg：按实际安装或捆绑方式履行 LGPL/GPL 等上游许可', '真实 RVC/UVR/Zero-shot 推理未作为本 Beta 的公开交付能力']
  }
};
function icon(app, cls='icon'){ return `<img class="${cls}" src="${app.icon}" alt="${app.name} 图标">`; }
function list(items){ return `<ul>${items.map(x=>`<li>${x}</li>`).join('')}</ul>`; }
function card(app){ return `<article class="card" data-product="${app.id}"><div class="card-top">${icon(app)}<span class="status ${app.statusClass}">${app.status}</span></div><h3>${app.name}</h3><p>${app.intro}</p><div class="card-bottom"><span>${app.kicker}</span><span class="arrow">↗</span></div></article>`; }
function home(){ return `<section class="hero-grid"><div><div class="eyebrow">INTELLIGENT EDITING / 01</div><h1>智能剪辑，<em>留在本地。</em></h1><p class="intro">面向真实创作流程的软件：声音转文字、音乐按秒重构、音频交付检查。每款软件独立下载，能力边界和技术来源公开说明。</p></div><div class="hero-art"><span class="art-label">LOCAL / CLEAR / EDITABLE</span><div class="signal">${Array.from({length:34},(_,i)=>`<span style="height:${25+((i*31)%75)}%"></span>`).join('')}</div></div></section><div class="section-head"><div><div class="eyebrow">软件</div><h2>公开软件</h2></div><span>2 个独立下载</span></div><section class="cards">${Object.values(apps).map(card).join('')}</section>`; }
function software(){ return `<section><div class="eyebrow">SOFTWARE / PUBLIC BETA</div><h1>软件</h1><p class="intro">按软件存放，而不是把不同能力混成一个下载包。每个产品都有独立详情、独立下载与独立状态说明。</p><div class="section-head"><div><div class="eyebrow">已公开</div><h2>全部软件</h2></div><span>${Object.keys(apps).length} 个</span></div><section class="cards">${Object.values(apps).map(card).join('')}</section></section>`; }
function oss(){ return `<section><div class="eyebrow">OPEN SOURCE / NOTICE</div><h1>开源与许可</h1><p class="intro">需要声明。我们使用了开源框架与模型；自有代码、第三方代码、模型权重和可下载发布包不是同一件事。</p><div class="detail-grid"><div class="panel"><h2>本站与软件代码</h2><p>本站页面代码以 MIT License 发布。两个软件当前公开的是下载入口；源码会在完成脱敏、第三方许可证清单和 NOTICE 后拆分发布。</p><p>不会把模型缓存、用户音频、Eagle 素材、日志、发布证据、签名记录或运行数据库提交到公开仓库。</p></div><div class="panel"><h2>核心上游组件</h2>${list(['声听：FastAPI、FunASR、ModelScope、PyTorch、FFmpeg、MCP', '音频工作台：React、Tauri、Rust、FastAPI、librosa、soundfile、PyTorch、FFmpeg、SQLite', '模型权重遵循其模型卡或权利声明；不因软件源码开源而自动改变模型许可'])}<p class="note">完整依赖清单与 NOTICE 会随对应源码仓库发布；当前页面不把“使用开源组件”误写成“所有模型可自由再分发”。</p></div></div></section>`; }
function detail(app){ return `<section class="detail"><button class="detail-back" data-route="software">← 返回软件</button><div class="detail-head">${icon(app,'detail-icon')}<div><div class="eyebrow">${app.kicker}</div><h1>${app.name}</h1><p class="detail-sub">${app.intro}</p></div></div><div class="detail-grid"><div class="panel"><h2>它能做什么</h2>${list(app.features)}<h2>技术与开源组件</h2>${list(app.technology)}<h2>声明</h2>${list(app.notices)}</div><div class="panel"><h2>安装与使用</h2><div class="facts">${app.facts.map(([k,v])=>`<div class="fact"><small>${k}</small><strong>${v}</strong></div>`).join('')}</div><p>${app.install}</p><a class="cta" href="${app.downloadUrl}" target="_blank" rel="noopener">下载 ${app.name} ↗</a><div class="note">本软件独立提取码：${app.downloadCode} · 下载即表示你理解当前公开测试状态。</div><button class="cta secondary" data-route="oss">查看开源与许可</button></div></div></section>`; }
function render(){ const hash=location.hash.slice(1)||'home'; let html=home(); let route='home'; if(hash==='software'){html=software();route='software'} else if(hash==='oss'){html=oss();route='oss'} else if(hash.startsWith('app/')){const app=apps[hash.split('/')[1]]; if(app){html=detail(app);route='detail'} else {location.hash='software';return}} root.innerHTML=html; document.querySelectorAll('[data-route]').forEach(el=>el.addEventListener('click',()=>location.hash=el.dataset.route)); document.querySelectorAll('[data-product]').forEach(el=>el.addEventListener('click',()=>location.hash=`app/${el.dataset.product}`)); document.querySelectorAll('.topbar nav button').forEach(el=>el.classList.toggle('active',el.dataset.route===route)); root.focus(); }
window.addEventListener('hashchange',render); render();
