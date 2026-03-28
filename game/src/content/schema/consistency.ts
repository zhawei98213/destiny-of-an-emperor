import { failSchema } from "@/content/schema/primitives";
import type {
  ContentDatabase,
  DialogueLineDefinition,
  EventDefinition,
  MapDefinition,
  SaveData,
} from "@/types/content";

function buildIndex<T extends { id: string }>(
  entries: T[],
  collectionName: string,
): Map<string, T> {
  const index = new Map<string, T>();

  for (const entry of entries) {
    if (index.has(entry.id)) {
      failSchema(collectionName, `duplicate id "${entry.id}"`);
    }

    index.set(entry.id, entry);
  }

  return index;
}

function buildMapNpcIndex(maps: MapDefinition[]): Set<string> {
  const ids = new Set<string>();

  for (const map of maps) {
    for (const npc of map.npcs) {
      if (ids.has(npc.id)) {
        failSchema(`maps.${map.id}.npcs`, `duplicate global npc id "${npc.id}"`);
      }

      ids.add(npc.id);
    }
  }

  return ids;
}

function buildMapSpawnIndex(maps: MapDefinition[]): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();

  for (const map of maps) {
    const spawnIds = new Set<string>();
    for (const spawn of map.spawnPoints) {
      if (spawnIds.has(spawn.id)) {
        failSchema(`maps.${map.id}.spawnPoints`, `duplicate spawn id "${spawn.id}"`);
      }

      spawnIds.add(spawn.id);
    }

    index.set(map.id, spawnIds);
  }

  return index;
}

function validateLayerDimensions(map: MapDefinition): void {
  map.tileLayers.forEach((layer, index) => {
    if (layer.width !== map.width || layer.height !== map.height) {
      failSchema(
        `maps.${map.id}.tileLayers[${index}]`,
        `layer dimensions ${layer.width}x${layer.height} must match map dimensions ${map.width}x${map.height}`,
      );
    }

    if (layer.tiles.length !== map.width * map.height) {
      failSchema(
        `maps.${map.id}.tileLayers[${index}].tiles`,
        `expected ${map.width * map.height} tiles, received ${layer.tiles.length}`,
      );
    }
  });

  map.collisionLayers.forEach((layer, index) => {
    if (layer.width !== map.width || layer.height !== map.height) {
      failSchema(
        `maps.${map.id}.collisionLayers[${index}]`,
        `layer dimensions ${layer.width}x${layer.height} must match map dimensions ${map.width}x${map.height}`,
      );
    }

    if (layer.blocked.length !== map.width * map.height) {
      failSchema(
        `maps.${map.id}.collisionLayers[${index}].blocked`,
        `expected ${map.width * map.height} entries, received ${layer.blocked.length}`,
      );
    }
  });
}

function validateRectInBounds(
  map: MapDefinition,
  path: string,
  x: number,
  y: number,
  width = 1,
  height = 1,
): void {
  if (x < 0 || y < 0 || width <= 0 || height <= 0 || x + width > map.width || y + height > map.height) {
    failSchema(path, `rectangle (${x}, ${y}, ${width}, ${height}) is outside map bounds ${map.width}x${map.height}`);
  }
}

function validateDialogueReferences(
  dialogueLines: DialogueLineDefinition[],
  npcIds: Set<string>,
): void {
  dialogueLines.forEach((line) => {
    if (line.speakerNpcId && !npcIds.has(line.speakerNpcId)) {
      failSchema(
        `dialogueLines.${line.id}.speakerNpcId`,
        `references missing npc "${line.speakerNpcId}"`,
      );
    }
  });
}

function validateEventReferences(
  events: EventDefinition[],
  lineIds: Set<string>,
  flagIds: Set<string>,
  shopIds: Set<string>,
  battleGroupIds: Set<string>,
  mapIndex: Map<string, MapDefinition>,
  spawnIndex: Map<string, Set<string>>,
  itemIds: Set<string>,
  partyMemberIds: Set<string>,
): void {
  function validateStep(step: EventDefinition["steps"][number], path: string): void {
    switch (step.type) {
      case "dialogue":
        if (!lineIds.has(step.lineId)) {
          failSchema(`${path}.lineId`, `references missing dialogue line "${step.lineId}"`);
        }
        break;
      case "setFlag":
      case "clearFlag":
        if (!flagIds.has(step.flagId)) {
          failSchema(`${path}.flagId`, `references missing flag "${step.flagId}"`);
        }
        break;
      case "ifFlag":
      case "ifNotFlag":
        if (!flagIds.has(step.flagId)) {
          failSchema(`${path}.flagId`, `references missing flag "${step.flagId}"`);
        }
        step.steps.forEach((nestedStep, nestedIndex) => {
          validateStep(nestedStep, `${path}.steps[${nestedIndex}]`);
        });
        break;
      case "warp":
        if (!mapIndex.has(step.targetMapId)) {
          failSchema(`${path}.targetMapId`, `references missing map "${step.targetMapId}"`);
        }

        if (!spawnIndex.get(step.targetMapId)?.has(step.targetSpawnId)) {
          failSchema(
            `${path}.targetSpawnId`,
            `references missing spawn "${step.targetSpawnId}" on map "${step.targetMapId}"`,
          );
        }
        break;
      case "giveItem":
      case "removeItem":
        if (!itemIds.has(step.itemId)) {
          failSchema(`${path}.itemId`, `references missing item "${step.itemId}"`);
        }
        break;
      case "joinParty":
        if (!partyMemberIds.has(step.partyMemberId)) {
          failSchema(
            `${path}.partyMemberId`,
            `references missing party member "${step.partyMemberId}"`,
          );
        }
        break;
      case "openShop":
        if (!shopIds.has(step.shopId)) {
          failSchema(`${path}.shopId`, `references missing shop "${step.shopId}"`);
        }
        break;
      case "startBattle":
        if (!battleGroupIds.has(step.battleGroupId)) {
          failSchema(
            `${path}.battleGroupId`,
            `references missing battle group "${step.battleGroupId}"`,
          );
        }
        break;
      case "playSfx":
      case "end":
        break;
    }
  }

  events.forEach((event) => {
    event.steps.forEach((step, index) => {
      validateStep(step, `events.${event.id}.steps[${index}]`);
    });
  });
}

export function validateContentReferences(database: ContentDatabase): ContentDatabase {
  const mapIndex = buildIndex(database.maps, "maps");
  const dialogueLineIndex = buildIndex(database.dialogueLines, "dialogueLines");
  const eventIndex = buildIndex(database.events, "events");
  const itemIndex = buildIndex(database.items, "items");
  buildIndex(database.partyMembers, "partyMembers");
  const enemyIndex = buildIndex(database.enemies, "enemies");
  const battleGroupIndex = buildIndex(database.battleGroups, "battleGroups");
  const shopIndex = buildIndex(database.shops, "shops");
  const skillIndex = buildIndex(database.skills, "skills");
  const flagIndex = buildIndex(database.flags, "flags");
  buildIndex(database.questStates, "questStates");
  const npcIds = buildMapNpcIndex(database.maps);
  const spawnIndex = buildMapSpawnIndex(database.maps);

  database.maps.forEach((map) => {
    validateLayerDimensions(map);

    map.portals.forEach((portal, index) => {
      validateRectInBounds(
        map,
        `maps.${map.id}.portals[${index}]`,
        portal.x,
        portal.y,
        portal.width,
        portal.height,
      );

      if (!mapIndex.has(portal.targetMapId)) {
        failSchema(
          `maps.${map.id}.portals[${index}].targetMapId`,
          `references missing map "${portal.targetMapId}"`,
        );
      }

      const targetSpawns = spawnIndex.get(portal.targetMapId);
      if (!targetSpawns?.has(portal.targetSpawnId)) {
        failSchema(
          `maps.${map.id}.portals[${index}].targetSpawnId`,
          `references missing spawn "${portal.targetSpawnId}" on map "${portal.targetMapId}"`,
        );
      }
    });

    map.spawnPoints.forEach((spawnPoint, index) => {
      validateRectInBounds(
        map,
        `maps.${map.id}.spawnPoints[${index}]`,
        spawnPoint.x,
        spawnPoint.y,
      );
    });

    map.npcs.forEach((npc, index) => {
      if (npc.eventId && !eventIndex.has(npc.eventId)) {
        failSchema(`maps.${map.id}.npcs[${index}].eventId`, `references missing event "${npc.eventId}"`);
      }

      if (npc.shopId && !shopIndex.has(npc.shopId)) {
        failSchema(`maps.${map.id}.npcs[${index}].shopId`, `references missing shop "${npc.shopId}"`);
      }

      validateRectInBounds(
        map,
        `maps.${map.id}.npcs[${index}]`,
        npc.x,
        npc.y,
      );
    });

    map.triggers.forEach((trigger, index) => {
      if (trigger.kind === "npcInteraction") {
        if (!trigger.npcId) {
          failSchema(`maps.${map.id}.triggers[${index}].npcId`, "npcInteraction trigger requires npcId");
        }

        if (!map.npcs.some((npc) => npc.id === trigger.npcId)) {
          failSchema(
            `maps.${map.id}.triggers[${index}].npcId`,
            `references missing npc "${trigger.npcId}" on map "${map.id}"`,
          );
        }
      } else {
        validateRectInBounds(
          map,
          `maps.${map.id}.triggers[${index}]`,
          trigger.x ?? 0,
          trigger.y ?? 0,
          trigger.width ?? 1,
          trigger.height ?? 1,
        );
      }

      if (!eventIndex.has(trigger.eventId)) {
        failSchema(
          `maps.${map.id}.triggers[${index}].eventId`,
          `references missing event "${trigger.eventId}"`,
        );
      }
    });
  });

  validateDialogueReferences(database.dialogueLines, npcIds);
  validateEventReferences(
    database.events,
    new Set(dialogueLineIndex.keys()),
    new Set(flagIndex.keys()),
    new Set(shopIndex.keys()),
    new Set(battleGroupIndex.keys()),
    mapIndex,
    spawnIndex,
    new Set(itemIndex.keys()),
    new Set(database.partyMembers.map((member) => member.id)),
  );

  database.shops.forEach((shop) => {
    shop.inventory.forEach((entry, index) => {
      if (!itemIndex.has(entry.itemId)) {
        failSchema(`shops.${shop.id}.inventory[${index}].itemId`, `references missing item "${entry.itemId}"`);
      }
    });
  });

  database.partyMembers.forEach((member) => {
    member.skills.forEach((skillId, index) => {
      if (!skillIndex.has(skillId)) {
        failSchema(`partyMembers.${member.id}.skills[${index}]`, `references missing skill "${skillId}"`);
      }
    });
  });

  database.enemies.forEach((enemy) => {
    enemy.skills.forEach((skillId, index) => {
      if (!skillIndex.has(skillId)) {
        failSchema(`enemies.${enemy.id}.skills[${index}]`, `references missing skill "${skillId}"`);
      }
    });
  });

  database.battleGroups.forEach((group) => {
    group.enemyIds.forEach((enemyId, index) => {
      if (!enemyIndex.has(enemyId)) {
        failSchema(`battleGroups.${group.id}.enemyIds[${index}]`, `references missing enemy "${enemyId}"`);
      }
    });
  });

  database.questStates.forEach((questState) => {
    if (!questState.stages.includes(questState.initialStage)) {
      failSchema(
        `questStates.${questState.id}.initialStage`,
        `must be one of the declared stages: ${questState.stages.join(", ")}`,
      );
    }
  });

  const firstMap = database.maps[0];
  if (!firstMap) {
    failSchema("maps", "at least one map is required");
  }

  if (database.partyMembers.length === 0) {
    failSchema("partyMembers", "at least one party member is required");
  }

  return database;
}

export function validateSaveDataReferences(
  saveData: SaveData,
  database: ContentDatabase,
): SaveData {
  const map = database.maps.find((entry) => entry.id === saveData.mapId);
  if (!map) {
    failSchema(`saveData.mapId`, `references missing map "${saveData.mapId}"`);
  }

  if (!map.spawnPoints.some((entry) => entry.id === saveData.spawnPointId)) {
    failSchema(
      "saveData.spawnPointId",
      `references missing spawn "${saveData.spawnPointId}" on map "${saveData.mapId}"`,
    );
  }

  saveData.partyMemberIds.forEach((memberId, index) => {
    if (!database.partyMembers.some((entry) => entry.id === memberId)) {
      failSchema(
        `saveData.partyMemberIds[${index}]`,
        `references missing party member "${memberId}"`,
      );
    }
  });

  saveData.inventory.items.forEach((entry, index) => {
    if (!database.items.some((item) => item.id === entry.itemId)) {
      failSchema(`saveData.inventory.items[${index}].itemId`, `references missing item "${entry.itemId}"`);
    }
  });

  Object.keys(saveData.flags).forEach((flagId) => {
    if (!database.flags.some((flag) => flag.id === flagId)) {
      failSchema(`saveData.flags.${flagId}`, `references missing flag "${flagId}"`);
    }
  });

  Object.entries(saveData.questStates).forEach(([questId, stage]) => {
    const quest = database.questStates.find((entry) => entry.id === questId);
    if (!quest) {
      failSchema(`saveData.questStates.${questId}`, `references missing quest state "${questId}"`);
    }

    if (!quest.stages.includes(stage)) {
      failSchema(
        `saveData.questStates.${questId}`,
        `invalid stage "${stage}", expected one of ${quest.stages.join(", ")}`,
      );
    }
  });

  return saveData;
}
