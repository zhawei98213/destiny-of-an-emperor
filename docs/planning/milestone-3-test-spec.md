# Test Spec: Milestone 3 — Town Interior + Evidence-Gated Inference / 测试规范：第三阶段

## Baseline commands / 基线命令

```sh
npm run check
python3 -m py_compile tools/nes_rom_tool.py
npm run rom:inspect
python3 tools/nes_rom_tool.py town-probe '吞食天地2.nes' --out .omx/rom-analysis/town-probe.json
```

## Data validation / 数据校验

Required assertions:

- Town/interior map dimensions are valid.
- Town transitions reference existing maps.
- NPC events include evidence status and text.
- Inn service references valid cost/recovery behavior.
- Evidence entries have `status` in `confirmed|inferred|unknown|prototype`.
- Missing NPC/service/transition/evidence references fail validation.

## ROM inference / ROM 推断

Required assertions:

- `town-probe` writes metadata only.
- `town-probe` output contains no raw bank bytes, text dump, image, palette, nametable, pattern table, or audio payload.
- Probe report classifies findings as metadata candidates, not confirmed town payload.
- Docs explain fallback to prototype when evidence threshold is not met.

## Town gameplay / 城镇玩法

Required assertions:

- Overworld Xiaopei event transitions to interior map.
- Interior exit transitions back to overworld.
- Two NPC interactions return dialogue and do not mutate unrelated state.
- Inn success with enough gold deducts cost, restores soldiers/tactics, sets `xiaopeiInnRested`.
- Inn failure with insufficient gold does not restore and does not set `xiaopeiInnRested`.
- Save/load preserves map id, position, gold, and town flag.

## Safety / 安全

Before each commit:

```sh
staged=$(git diff --cached --name-only)
printf '%s\n' "$staged" | grep -E '(^|/)(\.omx|roms|private|extracted-assets)(/|$)|\.(nes|NES|fc|FC|sav|srm|chr|prg|bin|png|bmp|wav|nsf)$' && exit 1 || true
git ls-files | grep -E '(^|/)(\.omx|roms|private|extracted-assets)(/|$)|\.(nes|NES|fc|FC|sav|srm|chr|prg|bin|png|bmp|wav|nsf)$' && exit 1 || true
```

## Final exit / 最终退出

- All baseline commands pass.
- HTTP smoke passes.
- Docs/process records bilingual and current.
- Deslop pass completed on changed files.
- Post-deslop regression passes.
- GitHub push succeeds.
- `git status --short --branch` is clean.
