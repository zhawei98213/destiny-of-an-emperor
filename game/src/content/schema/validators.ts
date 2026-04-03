import {
  ensureArray,
  ensureBoolean,
  ensureLiteral,
  ensureNumber,
  ensureOptionalBoolean,
  ensureOptionalNumber,
  ensureOptionalString,
  ensureRecord,
  ensureString,
  ensureStringArray,
  failSchema,
} from "@/content/schema/primitives";
import type {
  AssetBindingDefinition,
  AssetOverrideDefinition,
  AssetResource,
  BattleGroupDefinition,
  CollisionLayerDefinition,
  ContentDatabase,
  ContentManifest,
  ContentPack,
  DialogueLineDefinition,
  EncounterEntryDefinition,
  EncounterTableDefinition,
  EnemyDropDefinition,
  EnemyDefinition,
  EventDefinition,
  EventStep,
  FlagDefinition,
  InventoryEntry,
  InventoryState,
  ItemDefinition,
  MapDefinition,
  NpcDefinition,
  PartyMemberDefinition,
  PartyMemberState,
  PortalDefinition,
  QuestStateDefinition,
  SaveData,
  ShopDefinition,
  ShopInventoryEntry,
  SkillDefinition,
  SpawnPointDefinition,
  TileLayerDefinition,
  TriggerDefinition,
  UnitStats,
} from "@/types/content";

function validateAssetResource(value: unknown, path: string): AssetResource {
  const record = ensureRecord(value, path);
  const kind = ensureLiteral(
    record.kind,
    ["world-placeholder", "panel-style", "tileset-palette", "portrait-placeholder", "sprite-frame", "audio-ref", "icon-glyph"],
    `${path}.kind`,
  );

  switch (kind) {
    case "world-placeholder":
      return {
        kind,
        fillColor: ensureString(record.fillColor, `${path}.fillColor`),
        strokeColor: ensureString(record.strokeColor, `${path}.strokeColor`),
        accentColor: ensureString(record.accentColor, `${path}.accentColor`),
      };
    case "panel-style":
      return {
        kind,
        backgroundColor: ensureString(record.backgroundColor, `${path}.backgroundColor`),
        borderColor: ensureString(record.borderColor, `${path}.borderColor`),
        titleColor: ensureString(record.titleColor, `${path}.titleColor`),
        bodyColor: ensureString(record.bodyColor, `${path}.bodyColor`),
        accentColor: ensureString(record.accentColor, `${path}.accentColor`),
        frameMode: record.frameMode === undefined
          ? undefined
          : ensureLiteral(record.frameMode, ["solid", "nine-slice-css"] as const, `${path}.frameMode`),
        borderThickness: ensureOptionalNumber(record.borderThickness, `${path}.borderThickness`),
        cornerSize: ensureOptionalNumber(record.cornerSize, `${path}.cornerSize`),
        paddingX: ensureOptionalNumber(record.paddingX, `${path}.paddingX`),
        paddingY: ensureOptionalNumber(record.paddingY, `${path}.paddingY`),
        lineHeight: ensureOptionalNumber(record.lineHeight, `${path}.lineHeight`),
        pointerAssetKey: ensureOptionalString(record.pointerAssetKey, `${path}.pointerAssetKey`),
        pointerGlyph: ensureOptionalString(record.pointerGlyph, `${path}.pointerGlyph`),
        selectedPrefix: ensureOptionalString(record.selectedPrefix, `${path}.selectedPrefix`),
        selectedSuffix: ensureOptionalString(record.selectedSuffix, `${path}.selectedSuffix`),
        sourceManifestId: ensureOptionalString(record.sourceManifestId, `${path}.sourceManifestId`),
      };
    case "tileset-palette": {
      const tileColorsRecord = ensureRecord(record.tileColors, `${path}.tileColors`);
      return {
        kind,
        tileWidth: ensureNumber(record.tileWidth, `${path}.tileWidth`),
        tileHeight: ensureNumber(record.tileHeight, `${path}.tileHeight`),
        tileColors: Object.fromEntries(
          Object.entries(tileColorsRecord).map(([key, entry]) => [key, ensureString(entry, `${path}.tileColors.${key}`)]),
        ),
        sourceCandidateIds: ensureStringArray(record.sourceCandidateIds ?? [], `${path}.sourceCandidateIds`),
      };
    }
    case "portrait-placeholder":
      return {
        kind,
        backgroundColor: ensureString(record.backgroundColor, `${path}.backgroundColor`),
        borderColor: ensureString(record.borderColor, `${path}.borderColor`),
        textColor: ensureString(record.textColor, `${path}.textColor`),
      };
    case "sprite-frame":
      return {
        kind,
        sheetId: ensureString(record.sheetId, `${path}.sheetId`),
        frameId: ensureString(record.frameId, `${path}.frameId`),
        imagePath: ensureOptionalString(record.imagePath, `${path}.imagePath`),
      };
    case "audio-ref":
      return {
        kind,
        path: ensureOptionalString(record.path, `${path}.path`),
      };
    case "icon-glyph":
      return {
        kind,
        glyph: ensureString(record.glyph, `${path}.glyph`),
        color: ensureString(record.color, `${path}.color`),
        selectedColor: ensureOptionalString(record.selectedColor, `${path}.selectedColor`),
        sourceManifestId: ensureOptionalString(record.sourceManifestId, `${path}.sourceManifestId`),
      };
  }
}

function validateAssetBindingDefinition(value: unknown, path: string): AssetBindingDefinition {
  const record = ensureRecord(value, path);
  return {
    key: ensureString(record.key, `${path}.key`),
    category: ensureLiteral(
      record.category,
      ["tileset", "character-sprite", "npc-sprite", "enemy-sprite", "ui-panel", "portrait", "icon", "audio"],
      `${path}.category`,
    ),
    state: ensureLiteral(record.state, ["placeholder", "imported", "locked"], `${path}.state`),
    fallbackKey: ensureOptionalString(record.fallbackKey, `${path}.fallbackKey`),
    resource: validateAssetResource(record.resource, `${path}.resource`),
  };
}

function validateAssetOverrideDefinition(value: unknown, path: string): AssetOverrideDefinition {
  const record = ensureRecord(value, path);
  return {
    chapterId: ensureString(record.chapterId, `${path}.chapterId`),
    mapIds: ensureStringArray(record.mapIds, `${path}.mapIds`),
    assetBindings: ensureArray(record.assetBindings, `${path}.assetBindings`).map((entry, index) =>
      validateAssetBindingDefinition(entry, `${path}.assetBindings[${index}]`),
    ),
  };
}

function validateUnitStats(value: unknown, path: string): UnitStats {
  const record = ensureRecord(value, path);
  return {
    maxHp: ensureNumber(record.maxHp, `${path}.maxHp`),
    maxMp: ensureNumber(record.maxMp, `${path}.maxMp`),
    attack: ensureNumber(record.attack, `${path}.attack`),
    defense: ensureNumber(record.defense, `${path}.defense`),
    speed: ensureNumber(record.speed, `${path}.speed`),
  };
}

function validateEnemyDropDefinition(value: unknown, path: string): EnemyDropDefinition {
  const record = ensureRecord(value, path);
  return {
    itemId: ensureString(record.itemId, `${path}.itemId`),
    quantity: ensureNumber(record.quantity, `${path}.quantity`),
    chance: ensureNumber(record.chance, `${path}.chance`),
  };
}

export function validateTileLayerDefinition(value: unknown, path: string): TileLayerDefinition {
  const record = ensureRecord(value, path);
  return {
    id: ensureString(record.id, `${path}.id`),
    name: ensureString(record.name, `${path}.name`),
    width: ensureNumber(record.width, `${path}.width`),
    height: ensureNumber(record.height, `${path}.height`),
    tiles: ensureArray(record.tiles, `${path}.tiles`).map((tile, index) =>
      ensureNumber(tile, `${path}.tiles[${index}]`),
    ),
  };
}

export function validateCollisionLayerDefinition(
  value: unknown,
  path: string,
): CollisionLayerDefinition {
  const record = ensureRecord(value, path);
  return {
    id: ensureString(record.id, `${path}.id`),
    name: ensureString(record.name, `${path}.name`),
    width: ensureNumber(record.width, `${path}.width`),
    height: ensureNumber(record.height, `${path}.height`),
    blocked: ensureArray(record.blocked, `${path}.blocked`).map((entry, index) =>
      ensureNumber(entry, `${path}.blocked[${index}]`),
    ),
  };
}

export function validatePortalDefinition(value: unknown, path: string): PortalDefinition {
  const record = ensureRecord(value, path);
  return {
    id: ensureString(record.id, `${path}.id`),
    x: ensureNumber(record.x, `${path}.x`),
    y: ensureNumber(record.y, `${path}.y`),
    width: ensureNumber(record.width, `${path}.width`),
    height: ensureNumber(record.height, `${path}.height`),
    targetMapId: ensureString(record.targetMapId, `${path}.targetMapId`),
    targetSpawnId: ensureString(record.targetSpawnId, `${path}.targetSpawnId`),
  };
}

export function validateSpawnPointDefinition(
  value: unknown,
  path: string,
): SpawnPointDefinition {
  const record = ensureRecord(value, path);
  return {
    id: ensureString(record.id, `${path}.id`),
    x: ensureNumber(record.x, `${path}.x`),
    y: ensureNumber(record.y, `${path}.y`),
    facing: ensureLiteral(record.facing, ["up", "down", "left", "right"], `${path}.facing`),
  };
}

export function validateNpcDefinition(value: unknown, path: string): NpcDefinition {
  const record = ensureRecord(value, path);
  return {
    id: ensureString(record.id, `${path}.id`),
    name: ensureString(record.name, `${path}.name`),
    x: ensureNumber(record.x, `${path}.x`),
    y: ensureNumber(record.y, `${path}.y`),
    sprite: ensureString(record.sprite, `${path}.sprite`),
    facing: ensureLiteral(record.facing, ["up", "down", "left", "right"], `${path}.facing`),
    behavior: ensureLiteral(record.behavior ?? "idle", ["idle"], `${path}.behavior`),
    eventId: ensureOptionalString(record.eventId, `${path}.eventId`),
    shopId: ensureOptionalString(record.shopId, `${path}.shopId`),
  };
}

export function validateTriggerDefinition(value: unknown, path: string): TriggerDefinition {
  const record = ensureRecord(value, path);
  const kind = ensureLiteral(record.kind ?? "tile", ["npcInteraction", "tile", "region"], `${path}.kind`);
  const eventId = ensureOptionalString(record.eventId, `${path}.eventId`);
  const encounterTableId = ensureOptionalString(record.encounterTableId, `${path}.encounterTableId`);
  if (!eventId && !encounterTableId) {
    failSchema(path, "trigger must define either eventId or encounterTableId");
  }

  return {
    id: ensureString(record.id, `${path}.id`),
    kind,
    x: kind === "npcInteraction" ? ensureOptionalNumber(record.x, `${path}.x`) : ensureNumber(record.x, `${path}.x`),
    y: kind === "npcInteraction" ? ensureOptionalNumber(record.y, `${path}.y`) : ensureNumber(record.y, `${path}.y`),
    width: kind === "npcInteraction" ? ensureOptionalNumber(record.width, `${path}.width`) : ensureOptionalNumber(record.width, `${path}.width`) ?? 1,
    height: kind === "npcInteraction" ? ensureOptionalNumber(record.height, `${path}.height`) : ensureOptionalNumber(record.height, `${path}.height`) ?? 1,
    npcId: ensureOptionalString(record.npcId, `${path}.npcId`),
    eventId,
    encounterTableId,
    once: ensureOptionalBoolean(record.once, `${path}.once`) ?? false,
  };
}

function validateEncounterEntryDefinition(
  value: unknown,
  path: string,
): EncounterEntryDefinition {
  const record = ensureRecord(value, path);
  return {
    id: ensureString(record.id, `${path}.id`),
    battleGroupId: ensureString(record.battleGroupId, `${path}.battleGroupId`),
    weight: ensureNumber(record.weight, `${path}.weight`),
    requiredFlagId: ensureOptionalString(record.requiredFlagId, `${path}.requiredFlagId`),
    blockedFlagId: ensureOptionalString(record.blockedFlagId, `${path}.blockedFlagId`),
  };
}

export function validateEncounterTableDefinition(
  value: unknown,
  path: string,
): EncounterTableDefinition {
  const record = ensureRecord(value, path);
  return {
    id: ensureString(record.id, `${path}.id`),
    name: ensureString(record.name, `${path}.name`),
    stepInterval: ensureNumber(record.stepInterval, `${path}.stepInterval`),
    chance: ensureNumber(record.chance, `${path}.chance`),
    entries: ensureArray(record.entries, `${path}.entries`).map((entry, index) =>
      validateEncounterEntryDefinition(entry, `${path}.entries[${index}]`),
    ),
  };
}

export function validateMapDefinition(value: unknown, path: string): MapDefinition {
  const record = ensureRecord(value, path);
  return {
    id: ensureString(record.id, `${path}.id`),
    name: ensureString(record.name, `${path}.name`),
    width: ensureNumber(record.width, `${path}.width`),
    height: ensureNumber(record.height, `${path}.height`),
    tileWidth: ensureNumber(record.tileWidth, `${path}.tileWidth`),
    tileHeight: ensureNumber(record.tileHeight, `${path}.tileHeight`),
    tileLayers: ensureArray(record.tileLayers, `${path}.tileLayers`).map((entry, index) =>
      validateTileLayerDefinition(entry, `${path}.tileLayers[${index}]`),
    ),
    collisionLayers: ensureArray(record.collisionLayers, `${path}.collisionLayers`).map(
      (entry, index) =>
        validateCollisionLayerDefinition(entry, `${path}.collisionLayers[${index}]`),
    ),
    portals: ensureArray(record.portals, `${path}.portals`).map((entry, index) =>
      validatePortalDefinition(entry, `${path}.portals[${index}]`),
    ),
    spawnPoints: ensureArray(record.spawnPoints, `${path}.spawnPoints`).map((entry, index) =>
      validateSpawnPointDefinition(entry, `${path}.spawnPoints[${index}]`),
    ),
    npcs: ensureArray(record.npcs, `${path}.npcs`).map((entry, index) =>
      validateNpcDefinition(entry, `${path}.npcs[${index}]`),
    ),
    triggers: ensureArray(record.triggers, `${path}.triggers`).map((entry, index) =>
      validateTriggerDefinition(entry, `${path}.triggers[${index}]`),
    ),
  };
}

export function validateDialogueLineDefinition(
  value: unknown,
  path: string,
): DialogueLineDefinition {
  const record = ensureRecord(value, path);
  return {
    id: ensureString(record.id, `${path}.id`),
    speakerName: ensureString(record.speakerName, `${path}.speakerName`),
    speakerNpcId: ensureOptionalString(record.speakerNpcId, `${path}.speakerNpcId`),
    text: ensureString(record.text, `${path}.text`),
    portraitId: ensureOptionalString(record.portraitId, `${path}.portraitId`),
    soundId: ensureOptionalString(record.soundId, `${path}.soundId`),
    styleId: ensureOptionalString(record.styleId, `${path}.styleId`),
    locale: ensureOptionalString(record.locale, `${path}.locale`),
    revisionTag: ensureOptionalString(record.revisionTag, `${path}.revisionTag`),
  };
}

function validateEventStep(value: unknown, path: string): EventStep {
  const record = ensureRecord(value, path);
  const type = ensureLiteral(
    record.type,
    [
      "dialogue",
      "setFlag",
      "clearFlag",
      "ifFlag",
      "ifNotFlag",
      "ifHasItem",
      "warp",
      "giveItem",
      "removeItem",
      "joinParty",
      "openShop",
      "restoreParty",
      "startBattle",
      "playSfx",
      "end",
    ],
    `${path}.type`,
  );

  switch (type) {
    case "dialogue":
      return {
        type,
        lineId: ensureString(record.lineId, `${path}.lineId`),
      };
    case "setFlag":
      return {
        type,
        flagId: ensureString(record.flagId, `${path}.flagId`),
        value: ensureOptionalBoolean(record.value, `${path}.value`),
      };
    case "clearFlag":
      return {
        type,
        flagId: ensureString(record.flagId, `${path}.flagId`),
      };
    case "ifFlag":
      return {
        type,
        flagId: ensureString(record.flagId, `${path}.flagId`),
        steps: ensureArray(record.steps, `${path}.steps`).map((entry, index) =>
          validateEventStep(entry, `${path}.steps[${index}]`),
        ),
        elseSteps: record.elseSteps === undefined
          ? undefined
          : ensureArray(record.elseSteps, `${path}.elseSteps`).map((entry, index) =>
            validateEventStep(entry, `${path}.elseSteps[${index}]`),
          ),
      };
    case "ifNotFlag":
      return {
        type,
        flagId: ensureString(record.flagId, `${path}.flagId`),
        steps: ensureArray(record.steps, `${path}.steps`).map((entry, index) =>
          validateEventStep(entry, `${path}.steps[${index}]`),
        ),
        elseSteps: record.elseSteps === undefined
          ? undefined
          : ensureArray(record.elseSteps, `${path}.elseSteps`).map((entry, index) =>
            validateEventStep(entry, `${path}.elseSteps[${index}]`),
          ),
      };
    case "ifHasItem":
      return {
        type,
        itemId: ensureString(record.itemId, `${path}.itemId`),
        quantity: ensureOptionalNumber(record.quantity, `${path}.quantity`),
        steps: ensureArray(record.steps, `${path}.steps`).map((entry, index) =>
          validateEventStep(entry, `${path}.steps[${index}]`),
        ),
        elseSteps: record.elseSteps === undefined
          ? undefined
          : ensureArray(record.elseSteps, `${path}.elseSteps`).map((entry, index) =>
            validateEventStep(entry, `${path}.elseSteps[${index}]`),
          ),
      };
    case "warp":
      return {
        type,
        targetMapId: ensureString(record.targetMapId, `${path}.targetMapId`),
        targetSpawnId: ensureString(record.targetSpawnId, `${path}.targetSpawnId`),
      };
    case "giveItem":
      return {
        type,
        itemId: ensureString(record.itemId, `${path}.itemId`),
        quantity: ensureNumber(record.quantity, `${path}.quantity`),
      };
    case "removeItem":
      return {
        type,
        itemId: ensureString(record.itemId, `${path}.itemId`),
        quantity: ensureNumber(record.quantity, `${path}.quantity`),
      };
    case "joinParty":
      return {
        type,
        partyMemberId: ensureString(record.partyMemberId, `${path}.partyMemberId`),
      };
    case "openShop":
      return {
        type,
        shopId: ensureString(record.shopId, `${path}.shopId`),
      };
    case "restoreParty":
      return { type };
    case "startBattle":
      return {
        type,
        battleGroupId: ensureString(record.battleGroupId, `${path}.battleGroupId`),
      };
    case "playSfx":
      return {
        type,
        sfxId: ensureString(record.sfxId, `${path}.sfxId`),
      };
    case "end":
      return { type };
  }
}

export function validateEventDefinition(value: unknown, path: string): EventDefinition {
  const record = ensureRecord(value, path);
  return {
    id: ensureString(record.id, `${path}.id`),
    name: ensureString(record.name, `${path}.name`),
    steps: ensureArray(record.steps, `${path}.steps`).map((entry, index) =>
      validateEventStep(entry, `${path}.steps[${index}]`),
    ),
  };
}

export function validateItemDefinition(value: unknown, path: string): ItemDefinition {
  const record = ensureRecord(value, path);
  return {
    id: ensureString(record.id, `${path}.id`),
    name: ensureString(record.name, `${path}.name`),
    description: ensureString(record.description, `${path}.description`),
    kind: ensureLiteral(record.kind, ["consumable", "equipment", "key"], `${path}.kind`),
    price: ensureNumber(record.price, `${path}.price`),
  };
}

export function validateSkillDefinition(value: unknown, path: string): SkillDefinition {
  const record = ensureRecord(value, path);
  return {
    id: ensureString(record.id, `${path}.id`),
    name: ensureString(record.name, `${path}.name`),
    description: ensureString(record.description, `${path}.description`),
    mpCost: ensureNumber(record.mpCost, `${path}.mpCost`),
    power: ensureNumber(record.power, `${path}.power`),
    target: ensureLiteral(
      record.target,
      ["ally", "enemy", "self", "all-enemies"],
      `${path}.target`,
    ),
  };
}

export function validatePartyMemberDefinition(
  value: unknown,
  path: string,
): PartyMemberDefinition {
  const record = ensureRecord(value, path);
  return {
    id: ensureString(record.id, `${path}.id`),
    name: ensureString(record.name, `${path}.name`),
    className: ensureString(record.className, `${path}.className`),
    level: ensureNumber(record.level, `${path}.level`),
    skills: ensureStringArray(record.skills, `${path}.skills`),
    baseStats: validateUnitStats(record.baseStats, `${path}.baseStats`),
  };
}

export function validateEnemyDefinition(value: unknown, path: string): EnemyDefinition {
  const record = ensureRecord(value, path);
  return {
    id: ensureString(record.id, `${path}.id`),
    name: ensureString(record.name, `${path}.name`),
    level: ensureNumber(record.level, `${path}.level`),
    skills: ensureStringArray(record.skills, `${path}.skills`),
    rewardGold: ensureNumber(record.rewardGold, `${path}.rewardGold`),
    rewardExperience: ensureNumber(record.rewardExperience, `${path}.rewardExperience`),
    dropItems: ensureArray(record.dropItems ?? [], `${path}.dropItems`).map((entry, index) =>
      validateEnemyDropDefinition(entry, `${path}.dropItems[${index}]`),
    ),
    baseStats: validateUnitStats(record.baseStats, `${path}.baseStats`),
  };
}

export function validateBattleGroupDefinition(
  value: unknown,
  path: string,
): BattleGroupDefinition {
  const record = ensureRecord(value, path);
  return {
    id: ensureString(record.id, `${path}.id`),
    name: ensureString(record.name, `${path}.name`),
    enemyIds: ensureStringArray(record.enemyIds, `${path}.enemyIds`),
  };
}

export function validateShopInventoryEntry(
  value: unknown,
  path: string,
): ShopInventoryEntry {
  const record = ensureRecord(value, path);
  return {
    itemId: ensureString(record.itemId, `${path}.itemId`),
    price: ensureOptionalNumber(record.price, `${path}.price`),
  };
}

export function validateShopDefinition(value: unknown, path: string): ShopDefinition {
  const record = ensureRecord(value, path);
  return {
    id: ensureString(record.id, `${path}.id`),
    name: ensureString(record.name, `${path}.name`),
    inventory: ensureArray(record.inventory, `${path}.inventory`).map((entry, index) =>
      validateShopInventoryEntry(entry, `${path}.inventory[${index}]`),
    ),
  };
}

export function validateFlagDefinition(value: unknown, path: string): FlagDefinition {
  const record = ensureRecord(value, path);
  return {
    id: ensureString(record.id, `${path}.id`),
    defaultValue: ensureBoolean(record.defaultValue, `${path}.defaultValue`),
  };
}

export function validateQuestStateDefinition(
  value: unknown,
  path: string,
): QuestStateDefinition {
  const record = ensureRecord(value, path);
  return {
    id: ensureString(record.id, `${path}.id`),
    stages: ensureStringArray(record.stages, `${path}.stages`),
    initialStage: ensureString(record.initialStage, `${path}.initialStage`),
  };
}

export function validateInventoryEntry(value: unknown, path: string): InventoryEntry {
  const record = ensureRecord(value, path);
  return {
    itemId: ensureString(record.itemId, `${path}.itemId`),
    quantity: ensureNumber(record.quantity, `${path}.quantity`),
  };
}

export function validateInventoryState(value: unknown, path: string): InventoryState {
  const record = ensureRecord(value, path);
  return {
    gold: ensureNumber(record.gold, `${path}.gold`),
    items: ensureArray(record.items, `${path}.items`).map((entry, index) =>
      validateInventoryEntry(entry, `${path}.items[${index}]`),
    ),
  };
}

function validatePartyMemberState(value: unknown, path: string): PartyMemberState {
  const record = ensureRecord(value, path);
  return {
    memberId: ensureString(record.memberId, `${path}.memberId`),
    level: ensureNumber(record.level, `${path}.level`),
    experience: ensureNumber(record.experience, `${path}.experience`),
    currentHp: ensureNumber(record.currentHp, `${path}.currentHp`),
    currentMp: ensureNumber(record.currentMp, `${path}.currentMp`),
    statusIds: ensureStringArray(record.statusIds ?? [], `${path}.statusIds`),
    formationSlot: ensureNumber(record.formationSlot, `${path}.formationSlot`),
  };
}

export function validateSaveData(value: unknown, path = "saveData"): SaveData {
  const record = ensureRecord(value, path);
  const flagsRecord = ensureRecord(record.flags, `${path}.flags`);
  const questStatesRecord = ensureRecord(record.questStates, `${path}.questStates`);
  const worldRecord = ensureRecord(record.world, `${path}.world`);
  const shopStatesRecord = ensureRecord(record.shopStates ?? {}, `${path}.shopStates`);
  const saveMetaRecord = ensureRecord(record.saveMeta, `${path}.saveMeta`);

  const flags = Object.fromEntries(
    Object.entries(flagsRecord).map(([key, entry]) => [
      key,
      ensureBoolean(entry, `${path}.flags.${key}`),
    ]),
  );

  const questStates = Object.fromEntries(
    Object.entries(questStatesRecord).map(([key, entry]) => [
      key,
      ensureString(entry, `${path}.questStates.${key}`),
    ]),
  );

  const shopStates = Object.fromEntries(
    Object.entries(shopStatesRecord).map(([key, entry]) => {
      const shopRecord = ensureRecord(entry, `${path}.shopStates.${key}`);
      return [
        key,
        {
          visited: ensureBoolean(shopRecord.visited, `${path}.shopStates.${key}.visited`),
        },
      ];
    }),
  );

  const version = ensureNumber(record.version, `${path}.version`);
  if (version !== 3) {
    failSchema(`${path}.version`, `unsupported save version "${version}"`);
  }

  const partyStatesRecord = ensureRecord(record.partyStates ?? {}, `${path}.partyStates`);
  const partyStates = Object.fromEntries(
    Object.entries(partyStatesRecord).map(([key, entry]) => [
      key,
      validatePartyMemberState(entry, `${path}.partyStates.${key}`),
    ]),
  );

  return {
    version,
    slot: ensureString(record.slot, `${path}.slot`),
    world: {
      mapId: ensureString(worldRecord.mapId, `${path}.world.mapId`),
      spawnPointId: ensureString(worldRecord.spawnPointId, `${path}.world.spawnPointId`),
      playerX: ensureNumber(worldRecord.playerX, `${path}.world.playerX`),
      playerY: ensureNumber(worldRecord.playerY, `${path}.world.playerY`),
      facing: ensureLiteral(worldRecord.facing, ["up", "down", "left", "right"], `${path}.world.facing`),
      stepCount: ensureOptionalNumber(worldRecord.stepCount, `${path}.world.stepCount`) ?? 0,
    },
    partyMemberIds: ensureStringArray(record.partyMemberIds, `${path}.partyMemberIds`),
    partyStates,
    flags,
    questStates,
    inventory: validateInventoryState(record.inventory, `${path}.inventory`),
    chapterId: ensureOptionalString(record.chapterId, `${path}.chapterId`),
    shopStates,
    consumedTriggerIds: ensureStringArray(record.consumedTriggerIds ?? [], `${path}.consumedTriggerIds`),
    saveMeta: {
      createdByVersion: ensureNumber(saveMetaRecord.createdByVersion, `${path}.saveMeta.createdByVersion`),
      migratedFromVersion: ensureOptionalNumber(saveMetaRecord.migratedFromVersion, `${path}.saveMeta.migratedFromVersion`),
      migrationCount: ensureNumber(saveMetaRecord.migrationCount, `${path}.saveMeta.migrationCount`),
    },
  };
}

export function validateContentManifest(value: unknown, path: string): ContentManifest {
  const record = ensureRecord(value, path);
  return {
    root: ensureString(record.root, `${path}.root`),
    kind: ensureLiteral(record.kind, ["manual", "generated"], `${path}.kind`),
    files: ensureStringArray(record.files, `${path}.files`),
  };
}

export function validateContentPack(value: unknown, path: string): ContentPack {
  const record = ensureRecord(value, path);
  const meta = ensureRecord(record.meta, `${path}.meta`);

  return {
    meta: {
      id: ensureString(meta.id, `${path}.meta.id`),
      kind: ensureLiteral(meta.kind, ["manual", "generated"], `${path}.meta.kind`),
      version: ensureNumber(meta.version, `${path}.meta.version`),
      description: ensureString(meta.description, `${path}.meta.description`),
    },
    maps: ensureArray(record.maps ?? [], `${path}.maps`).map((entry, index) =>
      validateMapDefinition(entry, `${path}.maps[${index}]`),
    ),
    dialogueLines: ensureArray(record.dialogueLines ?? [], `${path}.dialogueLines`).map(
      (entry, index) => validateDialogueLineDefinition(entry, `${path}.dialogueLines[${index}]`),
    ),
    events: ensureArray(record.events ?? [], `${path}.events`).map((entry, index) =>
      validateEventDefinition(entry, `${path}.events[${index}]`),
    ),
    items: ensureArray(record.items ?? [], `${path}.items`).map((entry, index) =>
      validateItemDefinition(entry, `${path}.items[${index}]`),
    ),
    partyMembers: ensureArray(record.partyMembers ?? [], `${path}.partyMembers`).map(
      (entry, index) => validatePartyMemberDefinition(entry, `${path}.partyMembers[${index}]`),
    ),
    enemies: ensureArray(record.enemies ?? [], `${path}.enemies`).map((entry, index) =>
      validateEnemyDefinition(entry, `${path}.enemies[${index}]`),
    ),
    battleGroups: ensureArray(record.battleGroups ?? [], `${path}.battleGroups`).map(
      (entry, index) => validateBattleGroupDefinition(entry, `${path}.battleGroups[${index}]`),
    ),
    shops: ensureArray(record.shops ?? [], `${path}.shops`).map((entry, index) =>
      validateShopDefinition(entry, `${path}.shops[${index}]`),
    ),
    skills: ensureArray(record.skills ?? [], `${path}.skills`).map((entry, index) =>
      validateSkillDefinition(entry, `${path}.skills[${index}]`),
    ),
    flags: ensureArray(record.flags ?? [], `${path}.flags`).map((entry, index) =>
      validateFlagDefinition(entry, `${path}.flags[${index}]`),
    ),
    questStates: ensureArray(record.questStates ?? [], `${path}.questStates`).map(
      (entry, index) => validateQuestStateDefinition(entry, `${path}.questStates[${index}]`),
    ),
    encounterTables: ensureArray(record.encounterTables ?? [], `${path}.encounterTables`).map(
      (entry, index) => validateEncounterTableDefinition(entry, `${path}.encounterTables[${index}]`),
    ),
    assetBindings: ensureArray(record.assetBindings ?? [], `${path}.assetBindings`).map(
      (entry, index) => validateAssetBindingDefinition(entry, `${path}.assetBindings[${index}]`),
    ),
    assetOverrides: ensureArray(record.assetOverrides ?? [], `${path}.assetOverrides`).map(
      (entry, index) => validateAssetOverrideDefinition(entry, `${path}.assetOverrides[${index}]`),
    ),
  };
}

export function createEmptyContentDatabase(): ContentDatabase {
  return {
    packs: [],
    maps: [],
    dialogueLines: [],
    events: [],
    items: [],
    partyMembers: [],
    enemies: [],
    battleGroups: [],
    shops: [],
    skills: [],
    flags: [],
    questStates: [],
    encounterTables: [],
    assetBindings: [],
    assetOverrides: [],
  };
}
