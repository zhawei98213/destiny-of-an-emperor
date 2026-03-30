import { validateInventoryState, validateSaveData } from "@/content/schema";
import {
  ensureBoolean,
  ensureNumber,
  ensureOptionalString,
  ensureRecord,
  ensureString,
  ensureStringArray,
  failSchema,
} from "@/content/schema/primitives";
import type { SaveData } from "@/types/content";

export const SAVE_DATA_VERSION = 3;

type SaveRecord = Record<string, unknown>;

function cloneRecord(record: SaveRecord): SaveRecord {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, value]));
}

function normalizeBooleanRecord(value: unknown, path: string): Record<string, boolean> {
  const record = ensureRecord(value ?? {}, path);
  return Object.fromEntries(
    Object.entries(record).map(([key, entry]) => [key, ensureBoolean(entry, `${path}.${key}`)]),
  );
}

function normalizeStringRecord(value: unknown, path: string): Record<string, string> {
  const record = ensureRecord(value ?? {}, path);
  return Object.fromEntries(
    Object.entries(record).map(([key, entry]) => [key, ensureString(entry, `${path}.${key}`)]),
  );
}

function migrateSaveDataV1ToV2(value: SaveRecord, path: string): SaveRecord {
  const world = ensureRecord(value.world, `${path}.world`);
  return {
    version: 2,
    slot: ensureString(value.slot, `${path}.slot`),
    world: {
      mapId: ensureString(world.mapId, `${path}.world.mapId`),
      spawnPointId: ensureString(world.spawnPointId, `${path}.world.spawnPointId`),
      playerX: ensureNumber(world.playerX, `${path}.world.playerX`),
      playerY: ensureNumber(world.playerY, `${path}.world.playerY`),
      facing: ensureString(world.facing, `${path}.world.facing`),
      stepCount: typeof world.stepCount === "number" ? world.stepCount : 0,
    },
    partyMemberIds: ensureStringArray(value.partyMemberIds ?? [], `${path}.partyMemberIds`),
    partyStates: ensureRecord(value.partyStates ?? {}, `${path}.partyStates`),
    flags: normalizeBooleanRecord(value.flags ?? {}, `${path}.flags`),
    questStates: normalizeStringRecord(value.questStates ?? {}, `${path}.questStates`),
    inventory: validateInventoryState(value.inventory ?? { gold: 0, items: [] }, `${path}.inventory`),
    chapterId: ensureOptionalString(value.chapterId, `${path}.chapterId`),
    shopStates: ensureRecord(value.shopStates ?? {}, `${path}.shopStates`),
    consumedTriggerIds: ensureStringArray(value.consumedTriggerIds ?? [], `${path}.consumedTriggerIds`),
    saveMeta: {
      createdByVersion: 1,
      migratedFromVersion: 1,
      migrationCount: 1,
    },
  };
}

function migrateSaveDataV2ToV3(value: SaveRecord, path: string): SaveRecord {
  const next = cloneRecord(value);
  const existingSaveMeta = value.saveMeta && typeof value.saveMeta === "object"
    ? ensureRecord(value.saveMeta, `${path}.saveMeta`)
    : undefined;
  next.version = SAVE_DATA_VERSION;
  next.saveMeta = {
    createdByVersion: typeof existingSaveMeta?.createdByVersion === "number"
      ? existingSaveMeta.createdByVersion
      : 2,
    migratedFromVersion: 2,
    migrationCount: typeof existingSaveMeta?.migrationCount === "number"
      ? existingSaveMeta.migrationCount + 1
      : 1,
  };
  return next;
}

export function runSaveDataMigrations(value: unknown, path = "saveData"): SaveData {
  let record = ensureRecord(value, path);
  let version = ensureNumber(record.version, `${path}.version`);

  while (version < SAVE_DATA_VERSION) {
    if (version === 1) {
      record = migrateSaveDataV1ToV2(record, path);
      version = 2;
      continue;
    }

    if (version === 2) {
      record = migrateSaveDataV2ToV3(record, path);
      version = SAVE_DATA_VERSION;
      continue;
    }

    failSchema(`${path}.version`, `unsupported save version "${version}"`);
  }

  if (version > SAVE_DATA_VERSION) {
    failSchema(`${path}.version`, `unsupported future save version "${version}"`);
  }

  return validateSaveData(record, path);
}
