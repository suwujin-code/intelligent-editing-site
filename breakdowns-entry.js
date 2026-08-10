(() => {
  const root = document.querySelector('#app');
  if (!root) return;

  function injectBreakdownEntry() {
    const hash = location.hash.slice(1) || 'project/intelligent-editing';
    if (hash !== 'project/intelligent-editing') return;

    const page = root.querySelector('.editing-project-page');
    if (!page || page.querySelector('#breakdown-library-entry')) return;

    const section = document.createElement('section');
    section.className = 'reuse-section';
    section.id = 'breakdown-library-entry';
    section.innerHTML = `
      <div class="section-label">
        <div>
          <div class="eyebrow">CINEMA DNA / BREAKDOWN LIBRARY</div>
          <h2>拉片不是看完，而是拆成可复用能力</h2>
        </div>
        <span>关键分镜 · Motion · 排版 · 声音 · 导演判断</span>
      </div>
      <div class="reuse-grid">
        <div class="reuse-card"><small>对外学习</small><strong>导演关键分镜</strong><span>图片 + 时间码 + 画面 + 动画 + 声音 + 导演思路</span></div>
        <div class="reuse-card"><small>内部机器</small><strong>Frame-first Timeline</strong><span>Director / Editor / Art / Sound 使用同一时间轴</span></div>
        <div class="reuse-card"><small>当前首例</small><strong>AhaCreator 3.0</strong><span>Motion Design / UI Animation / Typography 深度复刻</span></div>
      </div>
      <p class="reuse-note">同一 Case 只维护一份机器事实源，再自动生成公开拉片页、NDJSON 时间线、Shot CSV 与 NLE / Remotion Adapter。公开页用于学习，内部完整 Cut Index 用于真正剪辑。</p>
      <div class="reuse-actions"><button class="cta" type="button" data-open-breakdowns>进入拉片库 ↗</button></div>
      <div class="reuse-privacy">母版时码、关键帧和 Motion 参数必须来自真实原片；未通过来源与权利门禁的素材不会伪装成公开案例。</div>`;

    const tools = page.querySelector('#tools');
    if (tools) page.insertBefore(section, tools);
    else page.appendChild(section);

    section.querySelector('[data-open-breakdowns]')?.addEventListener('click', () => {
      location.hash = 'breakdowns';
    });

    const mobileNav = page.querySelector('.mobile-bottom-nav');
    if (mobileNav && !mobileNav.querySelector('a[href="#breakdowns"]')) {
      const link = document.createElement('a');
      link.href = '#breakdowns';
      link.textContent = '拉片';
      const toolsLink = mobileNav.querySelector('a[href="#tools"]');
      mobileNav.insertBefore(link, toolsLink || null);
    }
  }

  window.addEventListener('hashchange', () => window.setTimeout(injectBreakdownEntry, 0));
  window.setTimeout(injectBreakdownEntry, 0);
})();
