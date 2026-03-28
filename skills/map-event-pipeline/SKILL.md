---
name: map-event-pipeline
description: Build and maintain tilemaps, triggers, dialogue, flags, and event interpreter workflows for a 2D JRPG remake. / 为 2D JRPG 重制项目构建和维护 tilemap、触发器、对话、标记以及事件解释器工作流。
---

Rules / 规则:
1. Triggers define when; events define what. / Trigger 定义何时发生，event 定义发生什么。
2. Map files must not embed hardcoded story logic. / 地图文件中不能嵌入硬编码剧情逻辑。
3. Dialogue content must come from structured content data. / 对话内容必须来自结构化内容数据。
4. Every new opcode must have at least one demo and one validation path. / 每个新 opcode 至少要有一个演示路径和一个校验路径。
5. Preserve backward compatibility unless explicitly migrating content. / 除非明确在做内容迁移，否则要保持向后兼容。
