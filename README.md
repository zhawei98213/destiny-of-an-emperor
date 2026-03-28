# Destiny of an Emperor Remake Skeleton

This repository starts a data-driven 2D JRPG remake foundation inspired by the structure of classic console RPGs. The current goal is infrastructure, not game content: clean module boundaries, typed content contracts, and testable runtime seams.

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
- `npm test`: run the Vitest suite once.
- `npm run build`: type-check and create a production build in `dist/`.

## Current Runtime

The playable skeleton contains four scenes:

- `BootScene`: loads bootstrap content and transfers control to the title screen.
- `TitleScene`: minimal entry screen; pressing Enter or clicking starts the world.
- `WorldScene`: displays a placeholder map and movable placeholder hero.
- `BattleScene`: placeholder battle screen entered with `B` and exited with `Esc`.

## Data-Driven Seams

The first extension points are intentionally small and typed:

- `contentLoader`: loads JSON content through an injectable reader.
- `schemaValidator`: validates runtime content contracts before use.
- `saveManager`: persists typed save slots behind a storage interface.
- `eventInterpreter`: executes declarative event commands such as dialogue and flags.

## Testing

The minimal test suite covers:

- content schema parsing and validation
- event interpreter command execution
- scene registry wiring and boot-first startup order

Use these tests as the baseline for future content pipelines, state machines, and gameplay systems.
