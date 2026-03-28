---
name: jrpg-runtime-architect
description: Maintain architecture and layering for a data-driven 2D JRPG remake. Use this skill when working on runtime boundaries, scene layering, state management, save data, or cross-module contracts.
---

Rules:
1. Favor data-driven design over hardcoded content.
2. Keep scenes thin and move gameplay logic into modules/services.
3. Do not place story flow directly in scene code.
4. Preserve separation between source, generated, and manual content.
5. When adding new data formats, update schema and validation.
6. When adding major features, include minimal tests or verification steps.