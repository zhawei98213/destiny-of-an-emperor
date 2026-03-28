import type { Facing, MapDefinition, NpcDefinition } from "@/types/content";
import type { WorldRuntimeState } from "@/world/worldRuntime";

export interface GridPoint {
  x: number;
  y: number;
}

export function getOffsetForFacing(facing: Facing): GridPoint {
  switch (facing) {
    case "left":
      return { x: -1, y: 0 };
    case "right":
      return { x: 1, y: 0 };
    case "up":
      return { x: 0, y: -1 };
    case "down":
      return { x: 0, y: 1 };
  }
}

export function getTileInFront(state: WorldRuntimeState): GridPoint {
  const offset = getOffsetForFacing(state.facing);
  return {
    x: state.playerX + offset.x,
    y: state.playerY + offset.y,
  };
}

export function findNpcAt(map: MapDefinition, point: GridPoint): NpcDefinition | undefined {
  return map.npcs.find((npc) => npc.x === point.x && npc.y === point.y);
}

export function findNpcInFront(
  map: MapDefinition,
  state: WorldRuntimeState,
): NpcDefinition | undefined {
  return findNpcAt(map, getTileInFront(state));
}
