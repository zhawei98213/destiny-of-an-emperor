---
name: jrpg-runtime-architect
description: Maintain architecture and layering for a data-driven 2D JRPG remake. Use this skill when working on runtime boundaries, scene layering, state management, save data, or cross-module contracts. / 维护数据驱动 2D JRPG 重制项目的架构和分层。在处理运行时边界、场景分层、状态管理、存档数据或跨模块契约时使用此 skill。
---

Rules / 规则:
1. Favor data-driven design over hardcoded content. / 优先选择数据驱动设计，而不是硬编码内容。
2. Keep scenes thin and move gameplay logic into modules/services. / 保持 scene 轻量，把玩法逻辑下沉到模块或服务中。
3. Do not place story flow directly in scene code. / 不要把剧情流程直接写进 scene 代码。
4. Preserve separation between source, generated, and manual content. / 保持 source、generated 和 manual 内容之间的分层隔离。
5. When adding new data formats, update schema and validation. / 添加新数据格式时，要同步更新 schema 和校验逻辑。
6. When adding major features, include minimal tests or verification steps. / 添加主要功能时，必须附带最小化测试或验证步骤。
