import { failSchema } from "@/content/schema/primitives";
import type {
  AssetBindingDefinition,
  ContentDatabase,
  DialogueLineDefinition,
  EncounterTableDefinition,
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

function buildAssetKeyIndex(
  entries: AssetBindingDefinition[],
  collectionName: string,
): Map<string, AssetBindingDefinition> {
  const index = new Map<string, AssetBindingDefinition>();

  for (const entry of entries) {
    if (index.has(entry.key)) {
      failSchema(collectionName, `duplicate key "${entry.key}"`);
    }

    index.set(entry.key, entry);
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
  assetKeys: Set<string>,
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
        step.elseSteps?.forEach((nestedStep, nestedIndex) => {
          validateStep(nestedStep, `${path}.elseSteps[${nestedIndex}]`);
        });
        break;
      case "ifHasItem":
        if (!itemIds.has(step.itemId)) {
          failSchema(`${path}.itemId`, `references missing item "${step.itemId}"`);
        }
        if ((step.quantity ?? 1) <= 0) {
          failSchema(`${path}.quantity`, "must be greater than 0");
        }
        step.steps.forEach((nestedStep, nestedIndex) => {
          validateStep(nestedStep, `${path}.steps[${nestedIndex}]`);
        });
        step.elseSteps?.forEach((nestedStep, nestedIndex) => {
          validateStep(nestedStep, `${path}.elseSteps[${nestedIndex}]`);
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
      case "restoreParty":
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
        if (!assetKeys.has(`audio.${step.sfxId}`)) {
          failSchema(`${path}.sfxId`, `references missing audio asset "audio.${step.sfxId}"`);
        }
        break;
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

function validateAssetBindings(
  assetBindings: AssetBindingDefinition[],
  assetOverrideBindings: AssetBindingDefinition[],
): Set<string> {
  const allBindings = [...assetBindings, ...assetOverrideBindings];
  const keySet = new Set(allBindings.map((entry) => entry.key));

  assetBindings.forEach((binding) => {
    if (binding.fallbackKey && !keySet.has(binding.fallbackKey)) {
      failSchema(`assetBindings.${binding.key}.fallbackKey`, `references missing asset key "${binding.fallbackKey}"`);
    }
  });

  assetOverrideBindings.forEach((binding) => {
    if (binding.fallbackKey && !keySet.has(binding.fallbackKey)) {
      failSchema(`assetOverrides.${binding.key}.fallbackKey`, `references missing asset key "${binding.fallbackKey}"`);
    }
  });

  return keySet;
}

function validateEncounterTables(
  encounterTables: EncounterTableDefinition[],
  battleGroupIds: Set<string>,
  flagIds: Set<string>,
): void {
  encounterTables.forEach((table) => {
    if (table.stepInterval <= 0) {
      failSchema(`encounterTables.${table.id}.stepInterval`, "must be greater than 0");
    }

    if (table.chance < 0 || table.chance > 1) {
      failSchema(`encounterTables.${table.id}.chance`, "must be between 0 and 1");
    }

    if (table.entries.length === 0) {
      failSchema(`encounterTables.${table.id}.entries`, "must define at least one encounter entry");
    }

    table.entries.forEach((entry, index) => {
      if (!battleGroupIds.has(entry.battleGroupId)) {
        failSchema(
          `encounterTables.${table.id}.entries[${index}].battleGroupId`,
          `references missing battle group "${entry.battleGroupId}"`,
        );
      }

      if (entry.weight <= 0) {
        failSchema(`encounterTables.${table.id}.entries[${index}].weight`, "must be greater than 0");
      }

      if (entry.requiredFlagId && !flagIds.has(entry.requiredFlagId)) {
        failSchema(
          `encounterTables.${table.id}.entries[${index}].requiredFlagId`,
          `references missing flag "${entry.requiredFlagId}"`,
        );
      }

      if (entry.blockedFlagId && !flagIds.has(entry.blockedFlagId)) {
        failSchema(
          `encounterTables.${table.id}.entries[${index}].blockedFlagId`,
          `references missing flag "${entry.blockedFlagId}"`,
        );
      }
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
  const encounterTableIndex = buildIndex(database.encounterTables, "encounterTables");
  const assetBindingIndex = buildAssetKeyIndex(database.assetBindings ?? [], "assetBindings");
  const npcIds = buildMapNpcIndex(database.maps);
  const spawnIndex = buildMapSpawnIndex(database.maps);
  const assetKeys = validateAssetBindings(
    [...assetBindingIndex.values()],
    (database.assetOverrides ?? []).flatMap((entry) => entry.assetBindings),
  );

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
      if (!assetKeys.has(`npc.${npc.sprite}`)) {
        failSchema(`maps.${map.id}.npcs[${index}].sprite`, `references missing npc asset "npc.${npc.sprite}"`);
      }

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

      if (trigger.eventId && !eventIndex.has(trigger.eventId)) {
        failSchema(
          `maps.${map.id}.triggers[${index}].eventId`,
          `references missing event "${trigger.eventId}"`,
        );
      }

      if (trigger.encounterTableId && !encounterTableIndex.has(trigger.encounterTableId)) {
        failSchema(
          `maps.${map.id}.triggers[${index}].encounterTableId`,
          `references missing encounter table "${trigger.encounterTableId}"`,
        );
      }

      if (trigger.encounterTableId && trigger.kind !== "region") {
        failSchema(
          `maps.${map.id}.triggers[${index}].encounterTableId`,
          "encounterTableId is only supported on region triggers",
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
    assetKeys,
  );

  database.dialogueLines.forEach((line) => {
    if (line.portraitId && !assetKeys.has(`portrait.${line.portraitId}`)) {
      failSchema(`dialogueLines.${line.id}.portraitId`, `references missing portrait asset "portrait.${line.portraitId}"`);
    }

    if (line.soundId && !assetKeys.has(`audio.${line.soundId}`)) {
      failSchema(`dialogueLines.${line.id}.soundId`, `references missing audio asset "audio.${line.soundId}"`);
    }
  });

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

    enemy.dropItems.forEach((drop, index) => {
      if (!itemIndex.has(drop.itemId)) {
        failSchema(`enemies.${enemy.id}.dropItems[${index}].itemId`, `references missing item "${drop.itemId}"`);
      }

      if (drop.quantity <= 0) {
        failSchema(`enemies.${enemy.id}.dropItems[${index}].quantity`, "must be greater than 0");
      }

      if (drop.chance < 0 || drop.chance > 1) {
        failSchema(`enemies.${enemy.id}.dropItems[${index}].chance`, "must be between 0 and 1");
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

  validateEncounterTables(
    database.encounterTables,
    new Set(battleGroupIndex.keys()),
    new Set(flagIndex.keys()),
  );

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
  const map = database.maps.find((entry) => entry.id === saveData.world.mapId);
  if (!map) {
    failSchema(`saveData.world.mapId`, `references missing map "${saveData.world.mapId}"`);
  }

  if (!map.spawnPoints.some((entry) => entry.id === saveData.world.spawnPointId)) {
    failSchema(
      "saveData.world.spawnPointId",
      `references missing spawn "${saveData.world.spawnPointId}" on map "${saveData.world.mapId}"`,
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

  Object.entries(saveData.partyStates).forEach(([memberId, partyState]) => {
    if (!database.partyMembers.some((entry) => entry.id === memberId)) {
      failSchema(`saveData.partyStates.${memberId}`, `references missing party member "${memberId}"`);
    }

    if (partyState.memberId !== memberId) {
      failSchema(`saveData.partyStates.${memberId}.memberId`, `must match key "${memberId}"`);
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

  Object.keys(saveData.shopStates).forEach((shopId) => {
    if (!database.shops.some((shop) => shop.id === shopId)) {
      failSchema(`saveData.shopStates.${shopId}`, `references missing shop "${shopId}"`);
    }
  });

  return saveData;
}
