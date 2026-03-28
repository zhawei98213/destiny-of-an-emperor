# Architecture Notes
# 架构说明

The runtime is split into scenes, systems, UI helpers, world modules, and content contracts so gameplay logic can move toward fully data-driven flows without coupling authoring formats to Phaser scene code.
运行时被拆分为场景、系统、UI 辅助层、世界模块和内容契约，这样玩法逻辑就能逐步走向完全数据驱动，而不会把内容编写格式直接耦合到 Phaser 场景代码里。

Dialogue presentation is intentionally separated from event execution: the event interpreter produces structured dialogue cues, while dialogue session and box modules handle reveal timing and rendering.
对话展示被刻意与事件执行分离：事件解释器负责产出结构化对话 cue，而 dialogue session 和 dialogue box 模块负责逐字节奏与渲染。

World triggers are also separated from events: triggers answer when something fires, while events answer what happens. NPC interaction, tile triggers, and region triggers all feed the same interpreter.
世界触发器同样与事件分离：trigger 只回答“何时触发”，event 只回答“发生什么”。NPC interaction、tile trigger 和 region trigger 都进入同一个解释器。
