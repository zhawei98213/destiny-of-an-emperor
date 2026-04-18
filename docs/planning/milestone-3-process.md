# Milestone 3 Process Record / 第三阶段过程记录

## 2026-04-18 — Ralplan from deep-interview / 从 deep-interview 进入 ralplan

中文：用户选择“平衡路线 + 城镇系统优先 + 客栈优先 + 原版优先 + 重度推断 + 证据门槛制”。本计划将 Milestone 3 定义为“小沛城镇内部 + 证据门槛制原版推断桥”。  
English: The user chose “balanced route + town system first + inn first + original-first + heavy inference + evidence gate.” This plan defines Milestone 3 as “Xiaopei town interior + evidence-gated original-inference bridge.”

## Planned verification / 计划验证

```sh
npm run check
python3 -m py_compile tools/nes_rom_tool.py
npm run rom:inspect
python3 tools/nes_rom_tool.py town-probe '吞食天地2.nes' --out .omx/rom-analysis/town-probe.json
```
