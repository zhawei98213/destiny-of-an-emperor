import assert from "node:assert/strict";
import { useBattleItemCommand } from "../src/game/battle-actions.js";
import { bossEncounters, enemyGroups, gameData, maps, officers, tileInfo } from "../src/game/data.js";
import { addItems, inventoryLines, itemQuantity, useItem } from "../src/game/items.js";
import { applyObjectiveEvent } from "../src/game/objectives.js";
import { applyInnEvent, applyTransitionEvent, npcDialogue } from "../src/game/town.js";
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
assertValidationFails((data) => { data.maps.province.events["7,15"].toMapId = "missing-map"; }, /references missing map/);
assertValidationFails((data) => { delete data.maps["xiaopei-interior"].events["4,7"].evidence; }, /missing evidence/);
assertValidationFails((data) => { data.maps["xiaopei-interior"].events["10,10"].evidence.status = "fake"; }, /invalid evidence status/);

const state = newGame();
const map = currentMap(state);
assert.equal(map.id, "province");
assert.equal(map.width, 32);
assert.equal(map.height, 30);
assert.equal(map.tiles.length, map.height);
assert.equal(map.tiles[0].length, map.width);
assert.equal(canEnter(map, state.player.x, state.player.y), true);
assert.equal(tileInfo[tileAt(map, 0, 0)].passable, false);
const xiaopeiGate = eventAt(map, 7, 15);
assert.equal(xiaopeiGate.name, "小沛");
assert.equal(xiaopeiGate.type, "transition");
assert.equal(eventAt(map, 6, 22).type, "boss");
const scoutEvent = eventAt(map, 25, 8);
assert.equal(scoutEvent.type, "objective");
assert.equal(scoutEvent.objectiveId, "rescue-scout");
assert.equal(scoutEvent.prerequisiteFlag, "hulaoCleared");
assert.equal(scoutEvent.flag, "scoutRescued");
assert.match(scoutEvent.text, /虎牢关已破/);
assert.ok(officers.length >= 3);
assert.ok(enemyGroups.length >= 3);
const transitionState = newGame();
const transitionResult = applyTransitionEvent(transitionState, xiaopeiGate);
assert.equal(transitionResult.ok, true);
assert.equal(transitionState.mapId, "xiaopei-interior");
assert.equal(transitionState.player.x, 8);
assert.equal(transitionState.player.y, 13);
const townMap = currentMap(transitionState);
assert.equal(townMap.id, "xiaopei-interior");
const exitResult = applyTransitionEvent(transitionState, eventAt(townMap, 8, 14));
assert.equal(exitResult.ok, true);
assert.equal(transitionState.mapId, "province");
const npcResult = npcDialogue(eventAt(townMap, 4, 7));
assert.match(npcResult.lines.join(" "), /小沛长者/);
const innEvent = eventAt(townMap, 10, 10);
const innState = newGame();
innState.gold = 10;
innState.party[0].soldiers = 1;
const innFail = applyInnEvent(innState, innEvent);
assert.equal(innFail.ok, false);
assert.equal(innState.flags.xiaopeiInnRested, false);
assert.equal(innState.party[0].soldiers, 1);
innState.gold = 120;
innState.party[0].tactics = 0;
const innSuccess = applyInnEvent(innState, innEvent);
assert.equal(innSuccess.ok, true);
assert.equal(innState.gold, 90);
assert.equal(innState.party[0].soldiers, innState.party[0].maxSoldiers);
assert.equal(innState.party[0].tactics, innState.party[0].maxTactics);
assert.equal(innState.flags.xiaopeiInnRested, true);

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
state.flags.xiaopeiInnRested = true;
state.mapId = "xiaopei-interior";
state.player.y = 13;
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
assert.equal(loaded.flags.xiaopeiInnRested, true);
assert.equal(loaded.mapId, "xiaopei-interior");
assert.equal(loaded.player.y, 13);
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
