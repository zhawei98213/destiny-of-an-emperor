# Destiny of an Emperor Remake Skeleton

This repository starts a data-driven 2D JRPG remake foundation inspired by the structure of classic console RPGs. The current goal is infrastructure, not game content: clean module boundaries, typed content contracts, reference-safe content packs, and testable runtime seams.

## Directory Layout

- `game/`: Phaser + TypeScript runtime, scenes, and core systems.
- `docs/`: design notes, architecture decisions, and future import pipeline docs.
- `tools/`: content build scripts, validators, and migration utilities.
- `content/source/`: raw extracted or imported upstream data.
- `content/generated/`: machine-generated runtime content artifacts.
- `content/manual/`: hand-authored JSON content and placeholder data.
- `tests/`: automated tests for content, runtime systems, and scene wiring.
- `skills/`: repository-specific agent workflows and reusable instructions.

## Commands

- `npm install`: install project dependencies.
- `npm run dev`: start the local Vite dev server.
- `npm run check:content`: validate manual and generated content packs plus cross-file references.
- `npm test`: run the Vitest suite once.
- `npm run build`: type-check and create a production build in `dist/`.

## Current Runtime

The playable skeleton contains four scenes:

- `BootScene`: loads bootstrap content and transfers control to the title screen.
- `TitleScene`: minimal entry screen; pressing Enter or clicking starts the world.
- `WorldScene`: renders data-driven maps, follows the player camera, applies grid collision, and transitions through map portals while preserving world runtime state.
- `BattleScene`: placeholder battle screen entered with `B` and exited with `Esc`.

## Data-Driven Seams

The first extension points are intentionally typed and data-driven:

- `contentLoader`: loads manifests from `content/manual/` and `content/generated/`, validates every pack, then merges them into one runtime database.
- `schema`: maps every JRPG content model to a matching TypeScript validator, including maps, events, items, NPCs, shops, battle groups, flags, quest states, inventory, and save data.
- `saveManager`: persists typed save slots and validates save references against the loaded content database.
- `eventInterpreter`: executes declarative event steps such as dialogue, flags, shops, and battle launches.

`content/source/` is reserved for raw import material and is intentionally outside the runtime loading path. `content/manual/` is for hand-authored packs. `content/generated/` is for tool-produced packs that already satisfy runtime schema.

## Testing

The current test suite covers:

- content schema parsing and manifest-based loading
- cross-reference validation failures with explicit error messages
- event interpreter command execution
- world runtime movement, collision, and portal transitions
- scene registry wiring and boot-first startup order

Manual verification in the current demo:

1. Run `npm run dev`.
2. Start the game and move around `town` with the arrow keys.
3. Walk into walls to confirm collision blocks movement.
4. Step onto the east gate portal in `town` to enter `field`.
5. Confirm the player appears at the `field` gate spawn and can return through the west portal.

Use these tests as the baseline for future content pipelines, state machines, and gameplay systems.
