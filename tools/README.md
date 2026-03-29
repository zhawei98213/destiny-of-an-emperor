# Tools
# 工具目录

Place importers, content compilers, schema checks, and migration scripts here as the pipeline grows.
随着内容管线扩展，应将导入器、内容编译器、schema 校验和迁移脚本放在这里。

Current first-pass tooling:
当前第一版工具包括：

- `tools/import-all.ts`: runs every importer and regenerates stable demo outputs in `content/generated/`.
- `tools/import-all.ts`：执行全部导入器，并在 `content/generated/` 中重新生成稳定的 demo 输出。
- `tools/importers/generateSpriteMetadata.ts`: builds deterministic sprite sheet metadata from `content/source/sprites/`.
- `tools/importers/generateSpriteMetadata.ts`：从 `content/source/sprites/` 生成稳定的精灵表元数据。
- `tools/importers/importMapContent.ts`: validates map source inputs and emits a staging report for future runtime pack generation.
- `tools/importers/importMapContent.ts`：校验地图原始输入，并输出供后续运行时内容包生成使用的 staging report。
- `tools/importers/importTextTables.ts`: validates text and event source inputs and emits a staging report.
- `tools/importers/importTextTables.ts`：校验文本与事件原始输入，并输出 staging report。
- `tools/importers/importGameData.ts`: imports enemy, item, and shop source tables and generates the runtime battle content pack plus a staging report.
- `tools/importers/importGameData.ts`：导入敌人、物品、商店原始表，并生成运行时战斗内容包和一个 staging report。
- `tools/validate-content.ts`: verifies source-derived generated files are up to date and then validates the final runtime content database.
- `tools/validate-content.ts`：先检查 generated 文件是否与 source 推导结果一致，再校验最终运行时内容数据库。
