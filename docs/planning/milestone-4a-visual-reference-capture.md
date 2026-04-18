# Milestone 4A Plan / 第四阶段 A 计划

中文：本阶段目标是停止主观视觉调整，建立基于本地 ROM 的私有参考截图管线。只允许项目内 JS/NPM 依赖；不使用系统 emulator。  
English: This milestone stops subjective visual tweaking and establishes a private local-ROM reference capture pipeline. Only project-local JS/NPM dependencies are allowed; no system emulator is required.

## Deliverables / 交付物

- 中文：NPM emulator 评估，首选 `jsnes`。  
  English: NPM emulator evaluation, starting with `jsnes`.
- 中文：`npm run rom:capture`。  
  English: `npm run rom:capture`.
- 中文：`.omx/visual-reference/` 私有输出。  
  English: private outputs under `.omx/visual-reference/`.
- 中文：成功 manifest 或 failure manifest。  
  English: success or failure manifest.
- 中文：双语文档说明。  
  English: bilingual documentation.

## Safety / 安全

中文：截图、帧缓存、save state、ROM-derived payload 全部不入库。  
English: Screenshots, framebuffers, save states, and ROM-derived payloads must not enter git.


## Mapper 74 shim result / Mapper 74 shim 结果

中文：`jsnes@2.1.0` 原生不支持 Mapper 74。加入本地 shim 后，ROM 可开始运行但约 4 帧后 invalid opcode，因此不能生成可信参考截图。  
English: `jsnes@2.1.0` does not natively support Mapper 74. After a local shim, the ROM starts running but hits an invalid opcode after about 4 frames, so it cannot produce trustworthy reference screenshots.
