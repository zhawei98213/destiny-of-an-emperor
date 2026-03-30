import type { ManualWorldContent } from "./manualContent";
import { loadManualWorldContent } from "./manualContent";

export interface NpcPlacementIssue {
  mapId: string;
  path: string;
  message: string;
}

export interface NpcPlacementReport {
  checkedMaps: number;
  checkedNpcs: number;
  issues: NpcPlacementIssue[];
}

function tileBlocked(
  map: ManualWorldContent["maps"][number],
  x: number,
  y: number,
): boolean {
  return map.collisionLayers.some((layer) => {
    const index = y * layer.width + x;
    return layer.blocked[index] === 1;
  });
}

function pointInsideRect(
  x: number,
  y: number,
  rect: { x: number; y: number; width: number; height: number },
): boolean {
  return x >= rect.x && x < rect.x + rect.width && y >= rect.y && y < rect.y + rect.height;
}

export async function runNpcPlacementCheck(): Promise<NpcPlacementReport> {
  const world = await loadManualWorldContent();
  const issues: NpcPlacementIssue[] = [];
  let checkedNpcs = 0;

  world.maps.forEach((map) => {
    const occupied = new Map<string, string>();

    map.npcs.forEach((npc, index) => {
      checkedNpcs += 1;
      const basePath = `maps[${map.id}].npcs[${index}]`;

      if (npc.x < 0 || npc.x >= map.width || npc.y < 0 || npc.y >= map.height) {
        issues.push({
          mapId: map.id,
          path: `${basePath}.x`,
          message: `NPC "${npc.id}" is out of bounds at (${npc.x}, ${npc.y})`,
        });
      }

      if (tileBlocked(map, npc.x, npc.y)) {
        issues.push({
          mapId: map.id,
          path: basePath,
          message: `NPC "${npc.id}" stands on a blocked collision tile (${npc.x}, ${npc.y})`,
        });
      }

      const tileKey = `${npc.x},${npc.y}`;
      const previousNpcId = occupied.get(tileKey);
      if (previousNpcId) {
        issues.push({
          mapId: map.id,
          path: basePath,
          message: `NPC "${npc.id}" overlaps NPC "${previousNpcId}" at (${npc.x}, ${npc.y})`,
        });
      } else {
        occupied.set(tileKey, npc.id);
      }

      map.spawnPoints.forEach((spawnPoint, spawnIndex) => {
        if (spawnPoint.x === npc.x && spawnPoint.y === npc.y) {
          issues.push({
            mapId: map.id,
            path: `${basePath}`,
            message: `NPC "${npc.id}" overlaps spawn point "${spawnPoint.id}" at maps[${map.id}].spawnPoints[${spawnIndex}]`,
          });
        }
      });

      map.portals.forEach((portal, portalIndex) => {
        if (pointInsideRect(npc.x, npc.y, portal)) {
          issues.push({
            mapId: map.id,
            path: `${basePath}`,
            message: `NPC "${npc.id}" overlaps portal "${portal.id}" at maps[${map.id}].portals[${portalIndex}]`,
          });
        }
      });

      map.triggers.forEach((trigger, triggerIndex) => {
        if (trigger.kind === "npcInteraction") {
          return;
        }

        const triggerX = trigger.x;
        const triggerY = trigger.y;
        const triggerWidth = trigger.width;
        const triggerHeight = trigger.height;
        if (
          typeof triggerX === "number" &&
          typeof triggerY === "number" &&
          typeof triggerWidth === "number" &&
          typeof triggerHeight === "number" &&
          pointInsideRect(npc.x, npc.y, {
            x: triggerX,
            y: triggerY,
            width: triggerWidth,
            height: triggerHeight,
          })
        ) {
          issues.push({
            mapId: map.id,
            path: `${basePath}`,
            message: `NPC "${npc.id}" overlaps trigger "${trigger.id}" at maps[${map.id}].triggers[${triggerIndex}]`,
          });
        }
      });
    });
  });

  return {
    checkedMaps: world.maps.length,
    checkedNpcs,
    issues,
  };
}
