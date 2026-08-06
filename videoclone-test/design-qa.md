# VideoClone OS V2 Design QA

- Reference: 浅色新拟态“双核心功能升级”设计稿
- Target: public responsive SPA
- Desktop viewport: 1440 × 1050
- Mobile viewport: 390 × 844

## Checks

- [x] Home shows exactly two primary creation modes: AI 视频复刻 / AI 口播生成
- [x] Both modes use separate four-step workflows
- [x] Video-clone flow separates reference video from replacement subject
- [x] Avatar flow separates avatar media, voice source, script, and generation
- [x] Mobile bottom navigation is fixed and visible
- [x] Mobile right-side drawer opens and closes
- [x] Desktop left navigation remains available
- [x] Clone end-to-end mock flow reaches result state
- [x] Avatar end-to-end mock flow reaches result state
- [x] No runtime JavaScript errors in tested flows
- [x] No horizontal overflow at desktop or mobile target layouts in visual inspection
- [x] User-uploaded files remain browser-local in the test build

## Remaining P3 polish

- Remote icon font and sample thumbnails depend on public CDN availability.
- Real API loading, error, cancellation, retry, and content-safety states are deferred until provider integration.

final result: passed
