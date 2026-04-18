export const CURRENT_SAVE_VERSION = 2;
export const SAVE_KEY = "doae-remake-save";

function normalizeInventory(inventory) {
  return { "healing-herb": 2, ...(inventory && typeof inventory === "object" ? inventory : {}) };
}

function normalizeFlags(flags) {
  return {
    hulaoCleared: false,
    visitedXiaopei: false,
    scoutRescued: false,
    ...(flags && typeof flags === "object" ? flags : {}),
  };
}

function normalizeObjectives(objectives) {
  return {
    active: "hulao-gate",
    completed: [],
    ...(objectives && typeof objectives === "object" ? objectives : {}),
  };
}

export function migrateSave(parsed) {
  if (!parsed || typeof parsed !== "object" || !parsed.player || !Array.isArray(parsed.party)) return null;
  const migrated = typeof structuredClone === "function" ? structuredClone(parsed) : JSON.parse(JSON.stringify(parsed));
  migrated.saveVersion = CURRENT_SAVE_VERSION;
  migrated.flags = normalizeFlags(migrated.flags);
  migrated.inventory = normalizeInventory(migrated.inventory);
  migrated.objectives = normalizeObjectives(migrated.objectives);
  migrated.messages = Array.isArray(migrated.messages) ? migrated.messages : [];
  migrated.gold = Number.isFinite(migrated.gold) ? migrated.gold : 0;
  migrated.food = Number.isFinite(migrated.food) ? migrated.food : 0;
  migrated.stepCounter = Number.isFinite(migrated.stepCounter) ? migrated.stepCounter : 0;
  migrated.encounterAfter = Number.isFinite(migrated.encounterAfter) ? migrated.encounterAfter : 7;
  migrated.menuIndex = Number.isInteger(migrated.menuIndex) ? migrated.menuIndex : 0;
  migrated.rngSeed = Number.isFinite(migrated.rngSeed) ? migrated.rngSeed : 1;
  migrated.battle = migrated.battle ?? null;
  migrated.mode = migrated.mode ?? "field";
  return migrated;
}

export function serializeSave(state) {
  return JSON.stringify({ ...state, saveVersion: CURRENT_SAVE_VERSION });
}

export function saveGame(state, storage = globalThis.localStorage) {
  storage.setItem(SAVE_KEY, serializeSave(state));
}

export function loadGame(storage = globalThis.localStorage) {
  const raw = storage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return migrateSave(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function resetCorruptSave(storage = globalThis.localStorage) {
  storage.removeItem(SAVE_KEY);
}
