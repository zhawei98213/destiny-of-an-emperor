---
name: map-event-pipeline
description: Build and maintain tilemaps, triggers, dialogue, flags, and event interpreter workflows for a 2D JRPG remake.
---

Rules:
1. Triggers define when; events define what.
2. Map files must not embed hardcoded story logic.
3. Dialogue content must come from structured content data.
4. Every new opcode must have at least one demo and one validation path.
5. Preserve backward compatibility unless explicitly migrating content.