import { maps, officers, enemyGroups, tileInfo } from "./data.js";
import { CURRENT_SAVE_VERSION } from "./save-constants.js";
export { CURRENT_SAVE_VERSION, loadGame, migrateSave, saveGame, serializeSave } from "./storage.js";

export function clone(value) {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

export function newGame() {
  const map = maps.province;
  return {
    mode: "field",
    mapId: map.id,
    player: { ...map.start, dir: "down" },
    party: clone(officers),
    gold: 120,
    food: 300,
    stepCounter: 0,
    encounterAfter: 7,
    messages: [],
    inventory: { "healing-herb": 2 },
    objectives: { active: "hulao-gate", completed: [] },
    saveVersion: CURRENT_SAVE_VERSION,
    flags: {
      hulaoCleared: false,
      visitedXiaopei: false,
      scoutRescued: false,
    },
    menuIndex: 0,
    battle: null,
    rngSeed: Date.now() & 0x7fffffff,
  };
}

export function rand(state) {
  state.rngSeed = (state.rngSeed * 1103515245 + 12345) & 0x7fffffff;
  return state.rngSeed / 0x80000000;
}

export function currentMap(state) {
  return maps[state.mapId];
}

export function tileAt(map, x, y) {
  if (x < 0 || y < 0 || x >= map.width || y >= map.height) return null;
  return map.tiles[y][x];
}

export function eventAt(map, x, y) {
  return map.events[`${x},${y}`] ?? null;
}

export function canEnter(map, x, y) {
  const tile = tileAt(map, x, y);
  return tile !== null && tileInfo[tile].passable;
}

export function living(list) {
  return list.filter((unit) => unit.soldiers > 0);
}

export function restoreParty(state) {
  for (const unit of state.party) {
    unit.soldiers = unit.maxSoldiers;
    unit.tactics = unit.maxTactics ?? unit.tactics;
  }
}

export function weightedEnemyGroup(state) {
  const total = enemyGroups.reduce((sum, group) => sum + group.weight, 0);
  let roll = rand(state) * total;
  for (const group of enemyGroups) {
    roll -= group.weight;
    if (roll <= 0) return clone(group);
  }
  return clone(enemyGroups[0]);
}

export function startBattle(state, group = weightedEnemyGroup(state), options = {}) {
  state.mode = "battle";
  state.battle = {
    groupId: group.id,
    groupName: group.name,
    enemies: clone(group.enemies),
    commandIndex: 0,
    phase: "command",
    log: options.openingLog ? [...options.openingLog] : [`${group.name} 出现了！`],
    round: 1,
    reward: options.reward ?? null,
    victoryFlag: options.victoryFlag ?? null,
    victoryText: options.victoryText ?? null,
    defeatText: options.defeatText ?? null,
    canRun: options.canRun ?? true,
  };
}
