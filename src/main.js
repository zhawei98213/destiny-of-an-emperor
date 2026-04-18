import { TILE, bossEncounters, tileInfo } from "./game/data.js";
import { useBattleItemCommand } from "./game/battle-actions.js";
import { inventoryLines } from "./game/items.js";
import { applyObjectiveEvent } from "./game/objectives.js";
import { applyInnEvent, applyTransitionEvent, npcDialogue } from "./game/town.js";
import {
  canEnter,
  currentMap,
  eventAt,
  living,
  loadGame,
  newGame,
  rand,
  saveGame,
  restoreParty,
  startBattle,
  tileAt,
} from "./game/state.js";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const TILE_SIZE = 16;
const VIEW_W = 16;
const VIEW_H = 15;
const FIELD_H = 176;
const COMMANDS = ["攻击", "计策", "物品", "撤退"];
const NES = Object.freeze({
  black: "#050505",
  white: "#f8f8f8",
  gray: "#7c7c7c",
  blue: "#2038ec",
  navy: "#000060",
  red: "#bc2c28",
  gold: "#f8b800",
  skin: "#f0bc78",
  hair: "#3f2416",
  grass1: "#58d854",
  grass2: "#00a844",
  forest1: "#008810",
  forest2: "#005800",
  road1: "#c08040",
  road2: "#805020",
  roof: "#d82800",
  wall: "#f8d878",
  mountain1: "#a8a8a8",
  mountain2: "#585858",
  water1: "#3cbcfc",
  water2: "#0078f8",
});
const keyMap = new Map([
  ["ArrowUp", "up"], ["w", "up"], ["W", "up"],
  ["ArrowDown", "down"], ["s", "down"], ["S", "down"],
  ["ArrowLeft", "left"], ["a", "left"], ["A", "left"],
  ["ArrowRight", "right"], ["d", "right"], ["D", "right"],
]);

let state = newGame();
let dialogue = [];
let lastTick = 0;
let romMetadata = null;
let menuPage = "root";

fetch("./src/game/generated/rom-metadata.json")
  .then((response) => response.ok ? response.json() : null)
  .then((metadata) => { romMetadata = metadata; draw(); })
  .catch(() => { romMetadata = null; });

function pushMessage(...lines) {
  state.messages = [...state.messages, ...lines].slice(-4);
}

function setDialogue(lines) {
  dialogue = Array.isArray(lines) ? [...lines] : [String(lines)];
  state.mode = "dialogue";
}

function dirDelta(dir) {
  if (dir === "up") return [0, -1];
  if (dir === "down") return [0, 1];
  if (dir === "left") return [-1, 0];
  return [1, 0];
}

function tryMove(dir) {
  const map = currentMap(state);
  state.player.dir = dir;
  const [dx, dy] = dirDelta(dir);
  const nx = state.player.x + dx;
  const ny = state.player.y + dy;
  if (!canEnter(map, nx, ny)) {
    pushMessage("道路被阻挡。");
    return;
  }
  state.player.x = nx;
  state.player.y = ny;
  const evt = eventAt(map, nx, ny);
  if (evt) {
    handleMapEvent(evt);
    return;
  }
  maybeEncounter(map, nx, ny);
}

function handleMapEvent(evt) {
  if (evt.type === "rest-town") {
    restoreParty(state);
    state.flags.visitedXiaopei = true;
    setDialogue([`${evt.name}`, evt.text, "队伍已经整备完毕。"]);
    return;
  }
  if (evt.type === "boss") {
    if (state.flags[evt.flag]) {
      setDialogue([evt.name, "关隘已破，官道重新畅通。MVP 目标已经完成。"]);
      return;
    }
    startBattle(state, bossEncounters[evt.bossId], {
      canRun: false,
      reward: 180,
      victoryFlag: evt.flag,
      openingLog: [evt.text],
      victoryText: ["虎牢关守军溃散！", "你打通了第一阶段复刻 MVP 的主线目标。"],
      defeatText: ["虎牢关守军太强。", "先回小沛休整，再来挑战。"],
    });
    return;
  }
  if (evt.type === "objective") {
    handleObjectiveEvent(evt);
    return;
  }
  if (evt.type === "transition") {
    setDialogue(applyTransitionEvent(state, evt).lines);
    return;
  }
  if (evt.type === "npc") {
    setDialogue(npcDialogue(evt).lines);
    return;
  }
  if (evt.type === "inn") {
    setDialogue(applyInnEvent(state, evt).lines);
    return;
  }
  setDialogue([`${evt.name}`, evt.text]);
}

function handleObjectiveEvent(evt) {
  setDialogue(applyObjectiveEvent(state, evt).lines);
}

function maybeEncounter(map, x, y) {
  const tile = tileAt(map, x, y);
  const encounterRate = tileInfo[tile].encounter;
  if (encounterRate <= 0) return;
  state.stepCounter += encounterRate;
  if (state.stepCounter >= state.encounterAfter) {
    state.stepCounter = 0;
    state.encounterAfter = 6 + Math.floor(rand(state) * 7);
    startBattle(state);
  }
}

function confirm() {
  if (state.mode === "dialogue") {
    dialogue.shift();
    if (dialogue.length === 0) state.mode = "field";
    return;
  }
  if (state.mode === "field") {
    state.mode = "menu";
    state.menuIndex = 0;
    menuPage = "root";
    return;
  }
  if (state.mode === "menu") {
    runMenuCommand();
    return;
  }
  if (state.mode === "battle") {
    runBattleCommand();
  }
}

function cancel() {
  if (state.mode === "menu" && menuPage !== "root") {
    menuPage = "root";
    return;
  }
  if (state.mode === "menu") state.mode = "field";
  else if (state.mode === "dialogue") { dialogue = []; state.mode = "field"; }
}

function runMenuCommand() {
  if (menuPage !== "root") {
    menuPage = "root";
    return;
  }
  const actions = ["status", "inventory", "save", "close"];
  const action = actions[state.menuIndex];
  if (action === "status") {
    menuPage = "status";
  } else if (action === "inventory") {
    menuPage = "inventory";
  } else if (action === "save") {
    saveGame(state);
    pushMessage("已保存。 / SAVED");
    state.mode = "field";
  } else {
    state.mode = "field";
  }
}

function runBattleCommand() {
  const battle = state.battle;
  const command = COMMANDS[battle.commandIndex];
  if (command === "攻击") autoAttackRound();
  else if (command === "计策") tacticRound();
  else if (command === "物品") itemRound();
  else attemptRun();
}

function itemRound() {
  const battle = state.battle;
  const result = useBattleItemCommand(state, battle, "healing-herb");
  if (result.ok) {
    autoEnemyRound();
  }
  finishRound();
}

function damage(attacker, defender, variance = 0) {
  const base = Math.max(8, attacker.attack + variance - Math.floor(defender.defense * 0.55));
  const scale = Math.max(0.35, attacker.soldiers / attacker.maxSoldiers);
  return Math.max(5, Math.floor(base * scale));
}

function autoAttackRound() {
  const battle = state.battle;
  const heroes = living(state.party);
  for (const hero of heroes) {
    const target = living(battle.enemies)[0];
    if (!target) break;
    const dealt = damage(hero, target, Math.floor(rand(state) * 10));
    target.soldiers = Math.max(0, target.soldiers - dealt);
    battle.log.push(`${hero.name} 攻击 ${target.name}，伤 ${dealt}。`);
  }
  autoEnemyRound();
  finishRound();
}

function tacticRound() {
  const battle = state.battle;
  const caster = living(state.party).find((unit) => unit.tactics > 0);
  const target = living(battle.enemies)[0];
  if (!caster || !target) {
    battle.log.push("无人可施计。" );
    autoEnemyRound();
    finishRound();
    return;
  }
  caster.tactics -= 1;
  const dealt = 58 + Math.floor(rand(state) * 42);
  target.soldiers = Math.max(0, target.soldiers - dealt);
  battle.log.push(`${caster.name} 施火计，${target.name} 损兵 ${dealt}。`);
  autoEnemyRound();
  finishRound();
}

function autoEnemyRound() {
  const battle = state.battle;
  for (const enemy of living(battle.enemies)) {
    const targets = living(state.party);
    if (targets.length === 0) break;
    const target = targets[Math.floor(rand(state) * targets.length)];
    const dealt = damage(enemy, target, Math.floor(rand(state) * 8));
    target.soldiers = Math.max(0, target.soldiers - dealt);
    battle.log.push(`${enemy.name} 反击 ${target.name}，伤 ${dealt}。`);
  }
}

function finishRound() {
  const battle = state.battle;
  battle.log = battle.log.slice(-5);
  if (living(battle.enemies).length === 0) {
    const reward = battle.reward ?? (32 + Math.floor(rand(state) * 36));
    state.gold += reward;
    if (battle.victoryFlag) state.flags[battle.victoryFlag] = true;
    const victoryText = battle.victoryText;
    state.battle = null;
    state.mode = "field";
    pushMessage(`战斗胜利！获得 ${reward} 金。`);
    if (victoryText) setDialogue(victoryText);
    return;
  }
  if (living(state.party).length === 0) {
    state.party.forEach((unit) => { unit.soldiers = Math.max(1, Math.floor(unit.maxSoldiers * 0.35)); });
    const defeatText = battle.defeatText;
    state.battle = null;
    state.mode = "field";
    setDialogue(defeatText ?? ["全军败退……", "你在小沛重新整备。"]);
    const map = currentMap(state);
    state.player = { ...map.start, dir: "down" };
    return;
  }
  battle.round += 1;
}

function attemptRun() {
  if (state.battle && state.battle.canRun === false) {
    state.battle.log.push("此战不能撤退！" );
    autoEnemyRound();
    finishRound();
    return;
  }
  if (rand(state) > 0.42) {
    state.battle.log.push("撤退成功。" );
    state.battle = null;
    state.mode = "field";
  } else {
    state.battle.log.push("撤退失败！" );
    autoEnemyRound();
    finishRound();
  }
}

function handleDirectional(dir) {
  if (state.mode === "field") tryMove(dir);
  else if (state.mode === "menu") {
    if (dir === "up") state.menuIndex = (state.menuIndex + 3) % 4;
    if (dir === "down") state.menuIndex = (state.menuIndex + 1) % 4;
  } else if (state.mode === "battle") {
    const battle = state.battle;
    if (dir === "up") battle.commandIndex = (battle.commandIndex + COMMANDS.length - 1) % COMMANDS.length;
    if (dir === "down") battle.commandIndex = (battle.commandIndex + 1) % COMMANDS.length;
  }
}

window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();
  if (keyMap.has(event.key)) handleDirectional(keyMap.get(event.key));
  else if (event.key === "Enter" || event.key === "z" || event.key === "Z") confirm();
  else if (event.key === "Escape" || event.key === "x" || event.key === "X") cancel();
  else if (event.key === "F5") { event.preventDefault(); saveGame(state); pushMessage("已保存。" ); }
  else if (event.key === "F9") {
    event.preventDefault();
    const loaded = loadGame();
    if (loaded) { state = loaded; pushMessage("已读取。" ); }
    else pushMessage("没有存档。" );
  }
  draw();
});

function checker(px, py, color, step = 4) {
  ctx.fillStyle = color;
  for (let yy = 0; yy < TILE_SIZE; yy += step) {
    for (let xx = (yy / step) % 2 ? step : 0; xx < TILE_SIZE; xx += step * 2) {
      ctx.fillRect(px + xx, py + yy, step, step);
    }
  }
}

function drawTile(x, y, tile) {
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;
  if (tile === TILE.GRASS) {
    ctx.fillStyle = NES.grass1; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    checker(px, py, NES.grass2, 4);
    ctx.fillStyle = "#b8f8b8"; ctx.fillRect(px + 2, py + 11, 2, 1); ctx.fillRect(px + 11, py + 5, 2, 1);
  } else if (tile === TILE.FOREST) {
    ctx.fillStyle = NES.forest1; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = NES.forest2;
    for (const [tx, ty] of [[2, 7], [7, 3], [11, 8]]) {
      ctx.fillRect(px + tx, py + ty, 4, 7);
      ctx.fillRect(px + tx - 2, py + ty + 2, 8, 3);
    }
  } else if (tile === TILE.MOUNTAIN) {
    ctx.fillStyle = "#383838"; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = NES.mountain1;
    ctx.beginPath(); ctx.moveTo(px + 1, py + 14); ctx.lineTo(px + 8, py + 2); ctx.lineTo(px + 15, py + 14); ctx.fill();
    ctx.fillStyle = NES.mountain2;
    ctx.beginPath(); ctx.moveTo(px + 8, py + 2); ctx.lineTo(px + 15, py + 14); ctx.lineTo(px + 9, py + 14); ctx.fill();
    ctx.fillStyle = NES.white; ctx.fillRect(px + 7, py + 5, 2, 2);
  } else if (tile === TILE.WATER) {
    ctx.fillStyle = NES.water1; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = NES.water2;
    ctx.fillRect(px, py + 4, 6, 2); ctx.fillRect(px + 8, py + 9, 8, 2); ctx.fillRect(px + 3, py + 13, 9, 1);
  } else if (tile === TILE.ROAD) {
    ctx.fillStyle = NES.road1; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    checker(px, py, NES.road2, 2);
  } else if (tile === TILE.TOWN) {
    ctx.fillStyle = NES.road1; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = NES.roof; ctx.fillRect(px + 2, py + 3, 12, 4);
    ctx.fillStyle = NES.wall; ctx.fillRect(px + 3, py + 7, 10, 7);
    ctx.fillStyle = NES.black; ctx.fillRect(px + 7, py + 10, 3, 4); ctx.fillRect(px + 4, py + 8, 2, 2);
  } else if (tile === TILE.FORT) {
    ctx.fillStyle = NES.road2; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = "#b8b8b8"; ctx.fillRect(px + 2, py + 5, 12, 9);
    ctx.fillStyle = NES.gray; ctx.fillRect(px + 2, py + 3, 3, 3); ctx.fillRect(px + 11, py + 3, 3, 3); ctx.fillRect(px + 7, py + 9, 3, 5);
    ctx.fillStyle = NES.black; ctx.fillRect(px + 6, py + 6, 2, 2); ctx.fillRect(px + 10, py + 6, 2, 2);
  }
}

function camera() {
  const map = currentMap(state);
  return {
    x: Math.max(0, Math.min(map.width - VIEW_W, state.player.x - Math.floor(VIEW_W / 2))),
    y: Math.max(0, Math.min(map.height - Math.floor(FIELD_H / TILE_SIZE), state.player.y - 5)),
  };
}

function drawField() {
  const map = currentMap(state);
  const cam = camera();
  for (let y = 0; y < Math.floor(FIELD_H / TILE_SIZE); y += 1) {
    for (let x = 0; x < VIEW_W; x += 1) {
      drawTile(x, y, tileAt(map, cam.x + x, cam.y + y));
    }
  }
  drawMapEvents(map, cam);
  const sx = (state.player.x - cam.x) * TILE_SIZE;
  const sy = (state.player.y - cam.y) * TILE_SIZE;
  drawHeroSprite(sx, sy);
}

function drawMapEvents(map, cam) {
  for (const [coord, event] of Object.entries(map.events ?? {})) {
    const [mx, my] = coord.split(",").map(Number);
    const sx = (mx - cam.x) * TILE_SIZE;
    const sy = (my - cam.y) * TILE_SIZE;
    if (sx < 0 || sy < 0 || sx >= 256 || sy >= FIELD_H) continue;
    if (event.type === "npc") drawNpcSprite(sx, sy);
    else if (event.type === "inn") drawInnSign(sx, sy);
    else if (event.type === "transition" && map.id !== "province") drawGateMarker(sx, sy);
  }
}

function drawNpcSprite(px, py) {
  ctx.fillStyle = NES.hair; ctx.fillRect(px + 5, py + 2, 6, 3);
  ctx.fillStyle = NES.skin; ctx.fillRect(px + 5, py + 5, 6, 4);
  ctx.fillStyle = NES.red; ctx.fillRect(px + 4, py + 9, 8, 5);
  ctx.fillStyle = NES.white; ctx.fillRect(px + 5, py + 14, 2, 2); ctx.fillRect(px + 9, py + 14, 2, 2);
  ctx.fillStyle = NES.black; ctx.fillRect(px + 6, py + 6, 1, 1); ctx.fillRect(px + 9, py + 6, 1, 1);
}

function drawInnSign(px, py) {
  ctx.fillStyle = NES.navy; ctx.fillRect(px + 2, py + 2, 12, 12);
  ctx.strokeStyle = NES.white; ctx.strokeRect(px + 2, py + 2, 12, 12);
  ctx.fillStyle = NES.gold; ctx.fillRect(px + 5, py + 5, 6, 2); ctx.fillRect(px + 7, py + 5, 2, 7);
  ctx.fillStyle = NES.white; ctx.fillRect(px + 4, py + 12, 8, 1);
}

function drawGateMarker(px, py) {
  ctx.fillStyle = NES.black; ctx.fillRect(px + 2, py + 2, 12, 12);
  ctx.strokeStyle = NES.white; ctx.strokeRect(px + 2, py + 2, 12, 12);
  ctx.fillStyle = NES.gold;
  ctx.fillRect(px + 7, py + 4, 2, 7);
  ctx.fillRect(px + 5, py + 9, 6, 2);
  ctx.fillRect(px + 6, py + 11, 4, 2);
}

function drawHeroSprite(px, py) {
  ctx.fillStyle = NES.hair; ctx.fillRect(px + 5, py + 2, 6, 3);
  ctx.fillStyle = NES.skin; ctx.fillRect(px + 5, py + 5, 6, 4);
  ctx.fillStyle = NES.blue; ctx.fillRect(px + 4, py + 9, 8, 5);
  ctx.fillStyle = NES.white; ctx.fillRect(px + 5, py + 14, 2, 2); ctx.fillRect(px + 9, py + 14, 2, 2);
  ctx.fillStyle = NES.black; ctx.fillRect(px + 6, py + 6, 1, 1); ctx.fillRect(px + 9, py + 6, 1, 1);
}

function drawPanel(x, y, w, h, fill = NES.black) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = NES.white;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  ctx.strokeStyle = NES.gray;
  ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
  ctx.fillStyle = NES.white;
  ctx.fillRect(x + 4, y + 4, 3, 1); ctx.fillRect(x + w - 7, y + 4, 3, 1);
  ctx.fillRect(x + 4, y + h - 5, 3, 1); ctx.fillRect(x + w - 7, y + h - 5, 3, 1);
}

function text(str, x, y, color = NES.white) {
  ctx.font = "12px 'Courier New', monospace";
  ctx.fillStyle = NES.black;
  ctx.fillText(str, x + 1, y + 1);
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

function drawNamePlate(label, x, y, w = 68) {
  drawPanel(x, y, w, 20, NES.navy);
  text(label, x + 8, y + 14, NES.gold);
}

function drawHud() {
  drawPanel(0, FIELD_H, 256, 64);
  const lead = living(state.party)[0] ?? state.party[0];
  const objective = state.flags.scoutRescued ? "斥候已救回" : (state.flags.hulaoCleared ? "救回应急斥候" : "击破虎牢关");
  text(`${currentMap(state).name}`, 8, FIELD_H + 15, NES.gold);
  text(`${lead.name} 兵 ${lead.soldiers}/${lead.maxSoldiers}`, 8, FIELD_H + 30);
  text(`金 ${state.gold}  粮 ${state.food}  目标 ${objective}`, 8, FIELD_H + 45);
  state.messages.slice(-1).forEach((line, i) => text(line, 8, FIELD_H + 59 + i * 12, NES.gold));
}

function drawDialogue() {
  drawPanel(8, 142, 240, 90);
  dialogue.slice(0, 4).forEach((line, index) => text(line, 18, 164 + index * 16));
  text("▼", 230, 220, NES.gold);
}

function drawMenu() {
  if (menuPage === "status") {
    drawStatusMenu();
    return;
  }
  if (menuPage === "inventory") {
    drawInventoryMenu();
    return;
  }
  drawPanel(148, 10, 96, 92, NES.navy);
  text("命令", 166, 28, NES.gold);
  ["状态", "物品", "保存", "关闭"].forEach((item, index) => {
    text(`${state.menuIndex === index ? "▶" : " "}${item}`, 164, 48 + index * 14, state.menuIndex === index ? NES.gold : NES.white);
  });
}

function drawStatusMenu() {
  drawPanel(10, 12, 236, 142, NES.black);
  text("状态", 22, 30, NES.gold);
  text("武将      兵力      攻  防  策", 22, 48, NES.gray);
  state.party.forEach((unit, i) => {
    const y = 66 + i * 24;
    const color = unit.soldiers > 0 ? NES.white : NES.gray;
    text(unit.name.padEnd(4, "　"), 22, y, color);
    text(`${String(unit.soldiers).padStart(4, " ")}/${unit.maxSoldiers}`, 78, y, color);
    text(`${String(unit.attack).padStart(2, " ")}  ${String(unit.defense).padStart(2, " ")}  ${String(unit.tactics).padStart(2, " ")}`, 158, y, color);
  });
  text("X/Esc 返回", 154, 140, NES.gold);
}

function drawInventoryMenu() {
  drawPanel(18, 18, 220, 120, NES.black);
  text("物品", 30, 38, NES.gold);
  text(`金 ${state.gold}    粮 ${state.food}`, 30, 56);
  inventoryLines(state).slice(0, 4).forEach((line, i) => text(line, 30, 78 + i * 16));
  text("战斗中选择『物品』可使用草药", 30, 126, NES.gray);
}

function drawBattleBackdrop() {
  ctx.fillStyle = NES.black;
  ctx.fillRect(0, 0, 256, 240);
  ctx.fillStyle = "#101010";
  for (let y = 0; y < 112; y += 8) {
    for (let x = 0; x < 256; x += 8) {
      if ((x + y) % 16 === 0) ctx.fillRect(x, y, 8, 8);
    }
  }
  ctx.fillStyle = "#303030";
  ctx.fillRect(0, 96, 256, 16);
}

function drawSoldierBar(x, y, w, current, max) {
  const ratio = Math.max(0, Math.min(1, current / max));
  ctx.fillStyle = NES.gray; ctx.fillRect(x, y, w, 4);
  ctx.fillStyle = ratio > 0.35 ? NES.grass1 : NES.red;
  ctx.fillRect(x, y, Math.max(1, Math.floor(w * ratio)), 4);
  ctx.strokeStyle = NES.black; ctx.strokeRect(x, y, w, 4);
}

function drawEnemySprite(x, y, scale = 1) {
  ctx.fillStyle = NES.red; ctx.fillRect(x + 8 * scale, y + 4 * scale, 16 * scale, 12 * scale);
  ctx.fillStyle = NES.skin; ctx.fillRect(x + 12 * scale, y, 8 * scale, 8 * scale);
  ctx.fillStyle = NES.white; ctx.fillRect(x + 10 * scale, y + 16 * scale, 12 * scale, 12 * scale);
  ctx.fillStyle = NES.black; ctx.fillRect(x + 14 * scale, y + 3 * scale, 2 * scale, 2 * scale);
  ctx.fillStyle = NES.gold; ctx.fillRect(x + 4 * scale, y + 12 * scale, 4 * scale, 16 * scale);
}

function drawBattle() {
  drawBattleBackdrop();
  const battle = state.battle;
  drawPanel(6, 6, 244, 24, NES.navy);
  text(`敌军 ${battle.groupName}`, 16, 22, NES.gold);
  text(`第 ${battle.round} 合`, 188, 22, NES.white);

  battle.enemies.slice(0, 3).forEach((unit, i) => {
    const x = 32 + i * 66;
    if (unit.soldiers > 0) drawEnemySprite(x, 42, 1);
    drawPanel(20 + i * 76, 82, 70, 26);
    text(unit.name.slice(0, 4), 26 + i * 76, 96, unit.soldiers > 0 ? NES.white : NES.gray);
    drawSoldierBar(26 + i * 76, 100, 54, unit.soldiers, unit.maxSoldiers);
  });

  drawPanel(6, 116, 116, 80);
  text("我军", 16, 132, NES.gold);
  state.party.forEach((unit, i) => {
    const y = 148 + i * 15;
    const color = unit.soldiers > 0 ? NES.white : NES.gray;
    text(`${unit.name}`, 16, y, color);
    text(`${String(unit.soldiers).padStart(4, " ")}`, 58, y, color);
    drawSoldierBar(90, y - 7, 24, unit.soldiers, unit.maxSoldiers);
  });

  drawPanel(128, 116, 58, 80, NES.navy);
  text("命令", 140, 132, NES.gold);
  COMMANDS.forEach((cmd, i) => text(`${battle.commandIndex === i ? "▶" : " "}${cmd}`, 138, 150 + i * 14, battle.commandIndex === i ? NES.gold : NES.white));

  drawPanel(188, 116, 62, 80);
  text("敌兵", 198, 132, NES.gold);
  battle.enemies.slice(0, 3).forEach((unit, i) => text(`${unit.name.slice(0, 2)} ${Math.max(0, unit.soldiers)}`, 196, 150 + i * 14, unit.soldiers > 0 ? NES.white : NES.gray));

  drawPanel(6, 198, 244, 36);
  battle.log.slice(-2).forEach((line, i) => text(line, 16, 214 + i * 14));
}

function draw() {
  ctx.clearRect(0, 0, 256, 240);
  if (state.mode === "battle") drawBattle();
  else {
    drawField();
    drawHud();
    if (state.mode === "dialogue") drawDialogue();
    if (state.mode === "menu") drawMenu();
  }
}

function loop(time) {
  if (time - lastTick > 120) {
    lastTick = time;
    draw();
  }
  requestAnimationFrame(loop);
}

pushMessage("方向键/WASD 直接移动", "Enter/Z 打开菜单");
requestAnimationFrame(loop);
