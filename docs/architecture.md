# Architecture Notes
# 架构说明

The runtime is split into scenes, systems, UI helpers, world modules, and content contracts so gameplay logic can move toward fully data-driven flows without coupling authoring formats to Phaser scene code.
运行时被拆分为场景、系统、UI 辅助层、世界模块和内容契约，这样玩法逻辑就能逐步走向完全数据驱动，而不会把内容编写格式直接耦合到 Phaser 场景代码里。

Dialogue presentation is intentionally separated from event execution: the event interpreter produces structured dialogue cues, while dialogue session and box modules handle reveal timing and rendering.
对话展示被刻意与事件执行分离：事件解释器负责产出结构化对话 cue，而 dialogue session 和 dialogue box 模块负责逐字节奏与渲染。

World triggers are also separated from events: triggers answer when something fires, while events answer what happens. NPC interaction, tile triggers, and region triggers all feed the same interpreter.
世界触发器同样与事件分离：trigger 只回答“何时触发”，event 只回答“发生什么”。NPC interaction、tile trigger 和 region trigger 都进入同一个解释器。

Menu flow is layered the same way. `WorldScene` only routes input and scene restarts, `MenuController` owns tab state plus save/load requests, `MenuOverlay` renders the menu UI, and `SaveManager` is the only persistence boundary.
菜单流程也遵循同样的分层方式。`WorldScene` 只负责输入路由和场景重启，`MenuController` 负责页签状态与存档读档请求，`MenuOverlay` 负责菜单 UI 渲染，而 `SaveManager` 是唯一的持久化边界。

The save layer is versioned on purpose. `SaveData` keeps world position, flags, inventory, party, chapter progress, quest states, shop state, and one-shot trigger consumption in one schema so future content systems can extend save behavior without rewriting scene code.
存档层被刻意设计为可版本化。`SaveData` 在同一份 schema 中保存世界坐标、flags、背包、队伍、章节进度、任务状态、商店状态和一次性 trigger 消费记录，这样未来扩展内容系统时无需回头重写 scene 代码。
