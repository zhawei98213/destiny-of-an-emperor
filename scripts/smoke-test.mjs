import assert from "node:assert/strict";
import { useBattleItemCommand } from "../src/game/battle-actions.js";
import { bossEncounters, enemyGroups, gameData, maps, officers, tileInfo } from "../src/game/data.js";
import { addItems, inventoryLines, itemQuantity, useItem } from "../src/game/items.js";
import { applyObjectiveEvent } from "../src/game/objectives.js";
import {
  canEnter,
  currentMap,
  eventAt,
  loadGame,
  migrateSave,
  newGame,
  restoreParty,
  saveGame,
  startBattle,
  tileAt,
} from "../src/game/state.js";
import { validateGameData } from "../src/game/validation/data-validation.js";

function memoryStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (key) => store.has(key) ? store.get(key) : null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  };
}

function mutableData() {
  return JSON.parse(JSON.stringify(gameData));
}

function assertValidationFails(mutator, expectedMessage) {
  const data = mutableData();
  mutator(data);
  assert.throws(() => validateGameData(data), expectedMessage);
}

assert.equal(validateGameData(gameData), true);
assertValidationFails((data) => data.officers.push({ ...data.officers[0] }), /officer duplicate id/);
assertValidationFails((data) => { data.maps.province.width += 1; }, /width mismatch/);
assertValidationFails((data) => { data.maps.province.events["6,22"].bossId = "missing-boss"; }, /missing boss/);
assertValidationFails((data) => { data.maps.province.events["25,8"].reward.items["missing-item"] = 1; }, /missing item/);
assertValidationFails((data) => { delete data.maps.province.events["25,8"].objectiveId; }, /missing objectiveId/);

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
const scoutEvent = eventAt(map, 25, 8);
assert.equal(scoutEvent.type, "objective");
assert.equal(scoutEvent.objectiveId, "rescue-scout");
assert.equal(scoutEvent.prerequisiteFlag, "hulaoCleared");
assert.equal(scoutEvent.flag, "scoutRescued");
assert.match(scoutEvent.text, /虎牢关已破/);
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
state.player.dir = "left";
state.party[1].soldiers = 321;
state.party[1].tactics = 4;
state.flags.hulaoCleared = true;
state.flags.scoutRescued = true;
state.inventory["healing-herb"] = 5;
state.objectives = { active: null, completed: ["hulao-gate", "rescue-scout"] };
state.gold = 777;
state.food = 222;
state.rngSeed = 123456;
saveGame(state, storage);
const loaded = loadGame(storage);
assert.equal(loaded.player.x, 9);
assert.equal(loaded.player.dir, "left");
assert.equal(loaded.party[1].soldiers, 321);
assert.equal(loaded.party[1].tactics, 4);
assert.equal(loaded.flags.hulaoCleared, true);
assert.equal(loaded.flags.scoutRescued, true);
assert.equal(loaded.inventory["healing-herb"], 5);
assert.deepEqual(loaded.objectives.completed, ["hulao-gate", "rescue-scout"]);
assert.equal(loaded.gold, 777);
assert.equal(loaded.food, 222);
assert.equal(loaded.rngSeed, 123456);
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
const battleForItem = { log: [] };
state.party[2].soldiers = state.party[2].maxSoldiers - 60;
const battleItem = useBattleItemCommand(state, battleForItem, "healing-herb");
assert.equal(battleItem.ok, true);
assert.match(battleForItem.log.at(-1), /恢复/);
assert.equal(itemQuantity(state, "healing-herb"), 1);

const lockedObjectiveState = newGame();
const lockedResult = applyObjectiveEvent(lockedObjectiveState, scoutEvent);
assert.equal(lockedResult.status, "locked");
assert.equal(lockedObjectiveState.flags.scoutRescued, false);
assert.equal(lockedObjectiveState.gold, 120);
const objectiveState = newGame();
objectiveState.flags.hulaoCleared = true;
const beforeGold = objectiveState.gold;
const beforeHerbs = itemQuantity(objectiveState, "healing-herb");
const completedResult = applyObjectiveEvent(objectiveState, scoutEvent);
assert.equal(completedResult.status, "completed");
assert.equal(objectiveState.flags.scoutRescued, true);
assert.equal(objectiveState.objectives.completed.includes("rescue-scout"), true);
assert.equal(objectiveState.gold, beforeGold + scoutEvent.reward.gold);
assert.equal(itemQuantity(objectiveState, "healing-herb"), beforeHerbs + scoutEvent.reward.items["healing-herb"]);
const repeatResult = applyObjectiveEvent(objectiveState, scoutEvent);
assert.equal(repeatResult.status, "already-complete");
assert.equal(objectiveState.gold, beforeGold + scoutEvent.reward.gold);
assert.equal(itemQuantity(objectiveState, "healing-herb"), beforeHerbs + scoutEvent.reward.items["healing-herb"]);

startBattle(state, enemyGroups[0]);
assert.equal(state.mode, "battle");
assert.equal(state.battle.enemies.length, enemyGroups[0].enemies.length);
startBattle(state, bossEncounters["hulao-commander"], { canRun: false, victoryFlag: "hulaoCleared" });
assert.equal(state.battle.canRun, false);
assert.equal(state.battle.victoryFlag, "hulaoCleared");
console.log("smoke ok");
