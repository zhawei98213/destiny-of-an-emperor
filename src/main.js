import { TILE, bossEncounters, tileInfo, openingText } from "./game/data.js";
import { useBattleItemCommand } from "./game/battle-actions.js";
import { inventoryLines } from "./game/items.js";
import { applyObjectiveEvent } from "./game/objectives.js";
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
const keyMap = new Map([
  ["ArrowUp", "up"], ["w", "up"], ["W", "up"],
  ["ArrowDown", "down"], ["s", "down"], ["S", "down"],
  ["ArrowLeft", "left"], ["a", "left"], ["A", "left"],
  ["ArrowRight", "right"], ["d", "right"], ["D", "right"],
]);

let state = newGame();
let dialogue = [...openingText];
let lastTick = 0;
let romMetadata = null;

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
  if (state.mode === "menu") state.mode = "field";
  else if (state.mode === "dialogue") { dialogue = []; state.mode = "field"; }
}

function runMenuCommand() {
  const actions = ["status", "inventory", "save", "close"];
  const action = actions[state.menuIndex];
  if (action === "status") {
    setDialogue(state.party.map((unit) => `${unit.name} 兵 ${unit.soldiers}/${unit.maxSoldiers} 攻 ${unit.attack} 防 ${unit.defense}`));
  } else if (action === "inventory") {
    setDialogue([`金 ${state.gold}`, `粮 ${state.food}`, ...inventoryLines(state), "选择战斗中的物品指令可使用草药。"]);
  } else if (action === "save") {
    saveGame(state);
    setDialogue("已保存到浏览器 localStorage。");
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

function drawTile(x, y, tile) {
  const info = tileInfo[tile];
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;
  ctx.fillStyle = info.colors[0];
  ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
  ctx.fillStyle = info.colors[1];
  if (tile === TILE.GRASS) {
    ctx.fillRect(px + 3, py + 11, 4, 1); ctx.fillRect(px + 10, py + 5, 3, 1);
  } else if (tile === TILE.FOREST) {
    ctx.fillRect(px + 6, py + 4, 4, 10); ctx.fillRect(px + 3, py + 7, 10, 4);
  } else if (tile === TILE.MOUNTAIN) {
    ctx.beginPath(); ctx.moveTo(px + 1, py + 14); ctx.lineTo(px + 8, py + 2); ctx.lineTo(px + 15, py + 14); ctx.fill();
  } else if (tile === TILE.WATER) {
    ctx.fillRect(px, py + 5, 16, 2); ctx.fillRect(px + 3, py + 11, 13, 2);
  } else if (tile === TILE.ROAD) {
    ctx.fillRect(px, py + 6, 16, 4); ctx.fillRect(px + 6, py, 4, 16);
  } else if (tile === TILE.TOWN || tile === TILE.FORT) {
    ctx.fillRect(px + 3, py + 5, 10, 8); ctx.fillStyle = "#e1c07a"; ctx.fillRect(px + 6, py + 8, 4, 5);
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
  const sx = (state.player.x - cam.x) * TILE_SIZE;
  const sy = (state.player.y - cam.y) * TILE_SIZE;
  ctx.fillStyle = "#f2d05a";
  ctx.fillRect(sx + 5, sy + 3, 6, 6);
  ctx.fillStyle = "#2c4f9c";
  ctx.fillRect(sx + 4, sy + 9, 8, 5);
  ctx.fillStyle = "#141414";
  ctx.fillRect(sx + 6, sy + 5, 1, 1);
  ctx.fillRect(sx + 9, sy + 5, 1, 1);
}

function drawPanel(x, y, w, h) {
  ctx.fillStyle = "#101010";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#f0f0f0";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
}

function text(str, x, y, color = "#ffffff") {
  ctx.fillStyle = color;
  ctx.font = "12px monospace";
  ctx.fillText(str, x, y);
}

function drawHud() {
  drawPanel(0, FIELD_H, 256, 64);
  const lead = living(state.party)[0] ?? state.party[0];
  const objective = state.flags.scoutRescued ? "目标:斥候已救回" : (state.flags.hulaoCleared ? "目标:救回应急斥候" : "目标:击破虎牢关");
  text(`${currentMap(state).name}  ${lead.name} 兵:${lead.soldiers}/${lead.maxSoldiers}  ${objective}`, 8, FIELD_H + 16);
  const romLine = romMetadata ? `ROM Mapper:${romMetadata.mapper} PRG:${Math.round(romMetadata.prgRomSize / 1024)}K CHR:${Math.round(romMetadata.chrRomSize / 1024)}K` : `金:${state.gold} 粮:${state.food}`;
  text(`${romLine}  坐标:${state.player.x},${state.player.y}`, 8, FIELD_H + 31);
  state.messages.slice(-2).forEach((line, i) => text(line, 8, FIELD_H + 46 + i * 12, "#ffd27a"));
}

function drawDialogue() {
  drawPanel(8, 148, 240, 84);
  dialogue.slice(0, 4).forEach((line, index) => text(line, 18, 170 + index * 16));
  text("▼", 230, 220, "#ffd27a");
}

function drawMenu() {
  drawPanel(160, 16, 84, 78);
  ["状态", "物品", "保存", "关闭"].forEach((item, index) => {
    text(`${state.menuIndex === index ? "▶" : " "}${item}`, 174, 36 + index * 15, state.menuIndex === index ? "#ffd27a" : "#fff");
  });
}

function drawBattle() {
  ctx.fillStyle = "#2a1d1d";
  ctx.fillRect(0, 0, 256, 240);
  const battle = state.battle;
  text(`遭遇 ${battle.groupName}  第${battle.round}合`, 10, 18, "#ffd27a");
  state.party.forEach((unit, i) => {
    text(`${unit.name.padEnd(4, "　")} ${String(unit.soldiers).padStart(4, " ")}/${unit.maxSoldiers}`, 10, 42 + i * 16, unit.soldiers > 0 ? "#fff" : "#777");
  });
  battle.enemies.forEach((unit, i) => {
    text(`${unit.name} ${unit.soldiers}/${unit.maxSoldiers}`, 138, 42 + i * 16, unit.soldiers > 0 ? "#ffb0a0" : "#777");
  });
  drawPanel(8, 118, 82, 88);
  COMMANDS.forEach((cmd, i) => text(`${battle.commandIndex === i ? "▶" : " "}${cmd}`, 22, 138 + i * 16, battle.commandIndex === i ? "#ffd27a" : "#fff"));
  drawPanel(96, 118, 152, 112);
  battle.log.slice(-5).forEach((line, i) => text(line, 106, 138 + i * 16));
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

setDialogue(openingText);
requestAnimationFrame(loop);
