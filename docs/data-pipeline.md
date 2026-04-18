# 数据管线 / Data Pipeline

## 原则 / Principles

中文：仓库只保存工具、结构定义、metadata 和文档；ROM payload 与提取素材必须留在本地私有目录。  
English: The repository stores tools, schemas, metadata, and documentation only. ROM payloads and extracted assets must remain in local private directories.

中文：所有生成数据分为两类：  
English: Generated data is split into two classes:

1. **可提交 metadata / Commit-safe metadata**  
   中文：header、mapper、bank 数量、hash、结构说明，不包含原始资源 payload。  
   English: Header fields, mapper ID, bank counts, hashes, and structural notes without raw asset payload.

2. **不可提交私有 payload / Private non-commit payload**  
   中文：提取图像、音乐、文本 dump、地图 dump、脚本 dump、二进制 bank 切片等。  
   English: Extracted images, music, text dumps, map dumps, script dumps, binary bank slices, and similar payloads.

## 当前输入 / Current input

- 中文：本地 ROM 文件：`吞食天地2.nes`。  
  English: Local ROM file: `吞食天地2.nes`.
- 中文：iNES, Mapper 74, PRG 1 MiB, CHR ROM 0。  
  English: iNES, Mapper 74, 1 MiB PRG, 0 CHR ROM.
- 中文：因为使用 CHR RAM，静态 CHR 提取不足以获得真实图形。  
  English: Because the cartridge uses CHR RAM, static CHR extraction is insufficient for reliable graphics recovery.

## 当前输出 / Current outputs

- `.omx/rom-analysis/metadata.json`  
  中文：私有完整分析 metadata。  
  English: Private full analysis metadata.

- `src/game/generated/rom-metadata.json`  
  中文：可提交的精简 metadata，用于游戏 HUD 与工具状态显示。  
  English: Commit-safe reduced metadata used by the game HUD and tooling status display.

- `.omx/rom-analysis/chr-candidates/`  
  中文：私有候选 tile sheet，仅供人工观察，不代表最终图形提取结果。  
  English: Private candidate tile sheets for inspection only; they are not final extracted graphics.

## 目标 JSON 结构 / Target JSON shape

中文：后续提取器应输出类似以下结构，让引擎不依赖 ROM 格式。  
English: Future extractors should produce normalized data like the following so the engine does not depend on ROM-specific layout.

```json
{
  "maps": [{ "id": "province", "width": 32, "height": 30, "tiles": [] }],
  "officers": [{ "id": "liu-bei", "name": "刘备", "soldiers": 420 }],
  "items": [{ "id": "herb", "name": "草药", "effect": "heal" }],
  "encounters": [{ "id": "bandits", "enemies": [] }],
  "scripts": [{ "id": "intro", "commands": [] }],
  "assets": [{ "id": "font-main", "kind": "tileset", "privatePath": ".omx/..." }]
}
```

## 后续提取顺序 / Extraction order

1. 中文：Mapper 74 bank switching 追踪。  
   English: Mapper 74 bank-switch tracing.
2. 中文：PPU pattern table、palette、nametable 快照。  
   English: PPU pattern table, palette, and nametable snapshots.
3. 中文：字库与 text table。  
   English: Font and text table discovery.
4. 中文：地图与事件脚本。  
   English: Maps and event scripts.
5. 中文：战斗、武将、物品参数。  
   English: Battle, officer, and item parameters.
6. 中文：引擎消费 normalized JSON。  
   English: Engine consumption of normalized JSON.


## Milestone 2 data boundary / 第二阶段数据边界

中文：第二阶段采用 checked-in generated JS data module + 单一 loader/boundary。规范化 JSON shape 仍记录在本文档中；运行时通过 `src/game/data.js` 导出统一数据，底层 prototype data 位于 `src/game/generated/prototype-data.js`，schema/reference 校验位于 `src/game/validation/data-validation.js`。  
English: Milestone 2 uses a checked-in generated JS data module plus a single loader/boundary. The normalized JSON shape remains documented here; runtime data is exported through `src/game/data.js`, prototype source-safe data lives in `src/game/generated/prototype-data.js`, and schema/reference checks live in `src/game/validation/data-validation.js`.
