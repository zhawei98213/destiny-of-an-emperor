# Test Spec: Milestone 2 — Data-Ready Playable Expansion / 测试规范：第二阶段

## Scope / 范围

中文：本测试规范验证第二阶段的计划质量与后续实现质量：数据边界、存档迁移、物品系统、第二目标链、ROM 安全骨架、双语文档和提交卫生。  
English: This spec validates Milestone 2 planning and future implementation quality: data boundary, save migration, item system, second objective chain, ROM-safe scaffold, bilingual docs, and commit hygiene.

## Baseline Commands / 基线命令

```sh
npm run check
python3 -m py_compile tools/nes_rom_tool.py
npm run rom:inspect
python3 -m http.server 8765
curl -fsS http://127.0.0.1:8765/
curl -fsS http://127.0.0.1:8765/src/main.js
curl -fsS http://127.0.0.1:8765/src/game/generated/rom-metadata.json
```

## Phase 0 Tests / 阶段 0 测试

- Check `.omx/plans/prd-milestone-2.md` exists.
- Check `.omx/plans/test-spec-milestone-2.md` exists.
- Check `docs/planning/milestone-2-plan.md` exists and is bilingual.
- Check `docs/planning/milestone-2-process.md` exists and records consensus steps.

## Data Boundary Tests / 数据边界测试

Required assertions / 必需断言:

- Duplicate IDs fail validation.
- Invalid map dimensions fail validation.
- Missing referenced boss/objective/item IDs fail validation.
- Runtime imports gameplay data through one public boundary.
- Commit-safe data contains no ROM payload, extracted graphics, text dump, audio, screenshots, nametables, palettes, pattern tables, or bank slices.

## Save Migration Tests / 存档迁移测试

Required assertions / 必需断言:

- Versionless MVP save migrates or resets deterministically.
- Malformed JSON returns null/new game safely and does not throw.
- Current save round-trip preserves:
  - player position and direction;
  - party soldiers/tactics;
  - flags;
  - inventory;
  - objective state;
  - gold/food;
  - RNG seed.

## Item System Tests / 物品系统测试

Required assertions / 必需断言:

- Healing item restores soldiers but clamps to max.
- Quantity decrements exactly once.
- Cannot use item with zero quantity.
- Empty inventory path is safe.
- Menu usage and battle usage have deterministic state transitions.

## Objective Chain Tests / 目标链测试

Required assertions / 必需断言:

- Hulao flag can be set by boss victory.
- Second objective is locked until `hulaoCleared` is true.
- Second objective completion sets `scoutRescued`.
- Chinese objective text includes `虎牢关已破。前往北平南道，救回应急斥候。` and is documented bilingually.

## ROM Safety Tests / ROM 安全测试

Before every commit / 每次提交前:

```sh
# Fail closed if staged files include private ROM/payload-like paths or extensions.
staged=$(git diff --cached --name-only)
printf '%s
' "$staged" | grep -E '(^|/)(\.omx|roms|private|extracted-assets)(/|$)|\.(nes|NES|fc|FC|sav|srm|chr|prg|bin|png|bmp|wav|nsf)$' && {
  echo "ERROR: staged private ROM/payload-like file detected" >&2
  exit 1
}

# Confirm known private examples are ignored when present.
git check-ignore -q '吞食天地2.nes' || {
  echo "ERROR: local ROM is not ignored" >&2
  exit 1
}
```

Fail if staged files include / 若暂存文件包含以下内容则失败:

- `.nes`, `.NES`, `.fc`, `.FC`, `.sav`, `.srm`, `.chr`, `.prg`, `.bin`
- `.omx/`, `roms/`, `private/`, or `extracted-assets/` payloads
- extracted images/audio/text dumps
- runtime capture payloads
- bank slices or raw binary dumps

## Documentation Tests / 文档测试

- Player-facing behavior changes update README or `docs/game-design.md` bilingually.
- Pipeline/policy changes update `docs/data-pipeline.md` or `docs/rom-analysis.md` bilingually.
- Each coherent slice updates `docs/planning/milestone-2-process.md` with:
  - date/time;
  - changed files;
  - checks run;
  - commit hash after push;
  - known gaps.

## Final Exit Criteria / 最终退出标准

- `npm run check` passes.
- `python3 -m py_compile tools/nes_rom_tool.py` passes.
- `npm run rom:inspect` passes with local ROM present.
- HTTP smoke passes.
- Private payload staged-file review passes.
- Docs are bilingual and current.
- GitHub push succeeds.
- `git status --short` is clean after push.
