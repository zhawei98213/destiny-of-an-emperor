import assert from "node:assert/strict";
import { bossEncounters, enemyGroups, gameData, maps, officers, tileInfo } from "../src/game/data.js";
import { validateGameData } from "../src/game/validation/data-validation.js";
import {
  canEnter,
  currentMap,
  eventAt,
  newGame,
  restoreParty,
  startBattle,
  tileAt,
} from "../src/game/state.js";

assert.equal(validateGameData(gameData), true);
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
startBattle(state, enemyGroups[0]);
assert.equal(state.mode, "battle");
assert.equal(state.battle.enemies.length, enemyGroups[0].enemies.length);
startBattle(state, bossEncounters["hulao-commander"], { canRun: false, victoryFlag: "hulaoCleared" });
assert.equal(state.battle.canRun, false);
assert.equal(state.battle.victoryFlag, "hulaoCleared");
console.log("smoke ok");
