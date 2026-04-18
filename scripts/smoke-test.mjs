import assert from "node:assert/strict";
import { bossEncounters, enemyGroups, gameData, maps, officers, tileInfo } from "../src/game/data.js";
import { addItems, inventoryLines, itemQuantity, useItem } from "../src/game/items.js";
import { validateGameData } from "../src/game/validation/data-validation.js";
import {
  canEnter,
  currentMap,
  eventAt,
  newGame,
  restoreParty,
  loadGame,
  migrateSave,
  saveGame,
  startBattle,
  tileAt,
} from "../src/game/state.js";

assert.equal(validateGameData(gameData), true);
function memoryStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (key) => store.has(key) ? store.get(key) : null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  };
}

const state = newGame();
const map = currentMap(state);
assert.equal(map.id, "province");
assert.equal(map.width, 32);
assert.equal(map.height, 30);
assert.equal(map.tiles.length, map.height);
assert.equal(map.tiles[0].length, map.width);
assert.equal(canEnter(map, state.player.x, state.player.y), true);
assert.equal(tileInfo[tileAt(map, 0, 0)].passable, false);
assert.equal(eventAt(map, 7, 15).name, "小沛");
assert.equal(eventAt(map, 6, 22).type, "boss");
assert.equal(eventAt(map, 25, 8).type, "objective");
assert.equal(eventAt(map, 25, 8).objectiveId, "rescue-scout");
assert.ok(officers.length >= 3);
assert.ok(enemyGroups.length >= 3);
state.party[0].soldiers = 1;
state.party[0].tactics = 0;
restoreParty(state);
assert.equal(state.party[0].soldiers, state.party[0].maxSoldiers);
assert.equal(state.party[0].tactics, state.party[0].maxTactics);
assert.equal(state.saveVersion, 2);
assert.equal(state.inventory["healing-herb"], 2);
assert.equal(state.flags.scoutRescued, false);
const versionlessSave = { ...state };
delete versionlessSave.saveVersion;
delete versionlessSave.inventory;
delete versionlessSave.objectives;
const migrated = migrateSave(versionlessSave);
assert.equal(migrated.saveVersion, 2);
assert.equal(migrated.inventory["healing-herb"], 2);
assert.equal(migrated.flags.scoutRescued, false);
assert.equal(migrateSave({ nope: true }), null);
const storage = memoryStorage();
state.player.x = 9;
state.flags.hulaoCleared = true;
saveGame(state, storage);
const loaded = loadGame(storage);
assert.equal(loaded.player.x, 9);
assert.equal(loaded.flags.hulaoCleared, true);
assert.equal(loaded.inventory["healing-herb"], 2);
assert.equal(loadGame(memoryStorage({ "doae-remake-save": "not-json" })), null);
state.party[0].soldiers = state.party[0].maxSoldiers - 50;
const herbCount = itemQuantity(state, "healing-herb");
const itemResult = useItem(state, "healing-herb", state.party[0]);
assert.equal(itemResult.ok, true);
assert.equal(state.party[0].soldiers, state.party[0].maxSoldiers);
assert.equal(itemQuantity(state, "healing-herb"), herbCount - 1);
state.inventory["healing-herb"] = 0;
assert.equal(useItem(state, "healing-herb", state.party[0]).ok, false);
assert.deepEqual(inventoryLines(state), ["没有可用物品。"]);
addItems(state, { "healing-herb": 2 });
assert.equal(itemQuantity(state, "healing-herb"), 2);
startBattle(state, enemyGroups[0]);
assert.equal(state.mode, "battle");
assert.equal(state.battle.enemies.length, enemyGroups[0].enemies.length);
startBattle(state, bossEncounters["hulao-commander"], { canRun: false, victoryFlag: "hulaoCleared" });
assert.equal(state.battle.canRun, false);
assert.equal(state.battle.victoryFlag, "hulaoCleared");
console.log("smoke ok");
