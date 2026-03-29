import path from "node:path";
import type {
  BattleGroupDefinition,
  DialogueLineDefinition,
  EnemyDefinition,
  EventDefinition,
  ItemDefinition,
  MapDefinition,
  ShopDefinition,
} from "../../game/src/types/content";
import {
  validateBattleGroupDefinition,
  validateDialogueLineDefinition,
  validateEnemyDefinition,
  validateEventDefinition,
  validateItemDefinition,
  validateMapDefinition,
  validateShopDefinition,
} from "../../game/src/content/schema/validators";
import { formatError, readJsonFile, repoRoot } from "./importerCore";

export interface SpriteFrameSource {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpriteSheetSource {
  sheetId: string;
  imagePath: string;
  tileWidth: number;
  tileHeight: number;
  frames: SpriteFrameSource[];
}

export interface MapSourceDocument {
  format: "map-source-v1";
  maps: MapDefinition[];
}

export interface TextSourceDocument {
  format: "text-source-v1";
  dialogueLines: DialogueLineDefinition[];
  events: EventDefinition[];
}

export interface GameDataSourceDocument {
  format: "game-data-source-v1";
  items: ItemDefinition[];
  shops: ShopDefinition[];
  enemies: EnemyDefinition[];
  battleGroups: BattleGroupDefinition[];
}

export async function loadSpriteSheetSource(filePath: string): Promise<SpriteSheetSource> {
  const document = await readJsonFile<Record<string, unknown>>(filePath);
  const relativePath = path.relative(repoRoot, filePath);
  if (typeof document.sheetId !== "string" || document.sheetId.length === 0) {
    throw formatError(relativePath, "sheetId", "must be a non-empty string");
  }

  if (typeof document.imagePath !== "string" || document.imagePath.length === 0) {
    throw formatError(relativePath, "imagePath", "must be a non-empty string");
  }

  if (typeof document.tileWidth !== "number") {
    throw formatError(relativePath, "tileWidth", "must be a number");
  }

  if (typeof document.tileHeight !== "number") {
    throw formatError(relativePath, "tileHeight", "must be a number");
  }

  if (!Array.isArray(document.frames)) {
    throw formatError(relativePath, "frames", "must be an array");
  }

  const frames = document.frames.map((entry, index) => {
    if (!entry || typeof entry !== "object") {
      throw formatError(relativePath, `frames[${index}]`, "must be an object");
    }

    const frame = entry as Record<string, unknown>;
    if (typeof frame.id !== "string" || frame.id.length === 0) {
      throw formatError(relativePath, `frames[${index}].id`, "must be a non-empty string");
    }

    ["x", "y", "width", "height"].forEach((fieldName) => {
      if (typeof frame[fieldName] !== "number") {
        throw formatError(relativePath, `frames[${index}].${fieldName}`, "must be a number");
      }
    });

    return {
      id: frame.id,
      x: frame.x as number,
      y: frame.y as number,
      width: frame.width as number,
      height: frame.height as number,
    };
  });

  return {
    sheetId: document.sheetId,
    imagePath: document.imagePath,
    tileWidth: document.tileWidth,
    tileHeight: document.tileHeight,
    frames,
  };
}

export async function loadMapSource(filePath: string): Promise<MapSourceDocument> {
  const document = await readJsonFile<Record<string, unknown>>(filePath);
  const relativePath = path.relative(repoRoot, filePath);
  if (document.format !== "map-source-v1") {
    throw formatError(relativePath, "format", 'must be "map-source-v1"');
  }

  if (!Array.isArray(document.maps)) {
    throw formatError(relativePath, "maps", "must be an array");
  }

  return {
    format: "map-source-v1",
    maps: document.maps.map((entry, index) =>
      validateMapDefinition(entry, `${relativePath}.maps[${index}]`),
    ),
  };
}

export async function loadTextSource(filePath: string): Promise<TextSourceDocument> {
  const document = await readJsonFile<Record<string, unknown>>(filePath);
  const relativePath = path.relative(repoRoot, filePath);
  if (document.format !== "text-source-v1") {
    throw formatError(relativePath, "format", 'must be "text-source-v1"');
  }

  if (!Array.isArray(document.dialogueLines)) {
    throw formatError(relativePath, "dialogueLines", "must be an array");
  }

  if (!Array.isArray(document.events)) {
    throw formatError(relativePath, "events", "must be an array");
  }

  return {
    format: "text-source-v1",
    dialogueLines: document.dialogueLines.map((entry, index) =>
      validateDialogueLineDefinition(entry, `${relativePath}.dialogueLines[${index}]`),
    ),
    events: document.events.map((entry, index) =>
      validateEventDefinition(entry, `${relativePath}.events[${index}]`),
    ),
  };
}

export async function loadGameDataSource(filePath: string): Promise<GameDataSourceDocument> {
  const document = await readJsonFile<Record<string, unknown>>(filePath);
  const relativePath = path.relative(repoRoot, filePath);
  if (document.format !== "game-data-source-v1") {
    throw formatError(relativePath, "format", 'must be "game-data-source-v1"');
  }

  if (!Array.isArray(document.items)) {
    throw formatError(relativePath, "items", "must be an array");
  }

  if (!Array.isArray(document.shops)) {
    throw formatError(relativePath, "shops", "must be an array");
  }

  if (!Array.isArray(document.enemies)) {
    throw formatError(relativePath, "enemies", "must be an array");
  }

  if (!Array.isArray(document.battleGroups)) {
    throw formatError(relativePath, "battleGroups", "must be an array");
  }

  return {
    format: "game-data-source-v1",
    items: document.items.map((entry, index) =>
      validateItemDefinition(entry, `${relativePath}.items[${index}]`),
    ),
    shops: document.shops.map((entry, index) =>
      validateShopDefinition(entry, `${relativePath}.shops[${index}]`),
    ),
    enemies: document.enemies.map((entry, index) =>
      validateEnemyDefinition(entry, `${relativePath}.enemies[${index}]`),
    ),
    battleGroups: document.battleGroups.map((entry, index) =>
      validateBattleGroupDefinition(entry, `${relativePath}.battleGroups[${index}]`),
    ),
  };
}
