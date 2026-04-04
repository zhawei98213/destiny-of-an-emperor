# Audio Workflow
# 音频工作流

This workflow keeps BGM and SFX references structured even before final source audio is available.
这套工作流在最终音频素材尚未到位前，先把 BGM 和 SFX 引用结构化管理起来。

Rules:
规则：

- Use logical audio keys through the shared asset registry.
- 统一通过共享 asset registry 使用逻辑音频 key。
- Chapter/map/battle routing belongs in `content/manual/audio-routing.content.json`.
- chapter / map / battle 的音频路由写在 `content/manual/audio-routing.content.json`。
- Missing audio must fall back to `audio.default`, `audio.bgm.default.world`, or `audio.bgm.default.battle`.
- 缺失音频必须回退到 `audio.default`、`audio.bgm.default.world` 或 `audio.bgm.default.battle`。
- Reference audio inputs can exist, but must not be used as direct runtime shortcuts.
- 参考音频输入可以存在，但不能直接作为 runtime 捷径使用。

Outputs:
输出：

- `reports/audio-workflow/latest/report.json`
- `reports/audio-workflow/latest/summary.md`

Command:
命令：

- `npm run audio-workflow`
