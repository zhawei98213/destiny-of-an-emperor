---
name: battle-system
description: Build and maintain the battle domain, turn flow, AI, reward calculation, and battle-world transitions for a data-driven JRPG remake.
---

Rules:
1. Battle data must be content-driven.
2. BattleScene should orchestrate, not own all combat logic.
3. Rewards must flow through shared state containers.
4. Keep clear contracts between world state and battle state.
5. Add smoke tests for battle start, finish, reward, and failure paths.