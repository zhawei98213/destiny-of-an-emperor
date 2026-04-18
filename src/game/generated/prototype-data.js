import { TILE } from "../tile-types.js";

function buildProvinceMap() {
  const width = 32;
  const height = 30;
  const tiles = Array.from({ length: height }, () => Array(width).fill(TILE.GRASS));

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) tiles[y][x] = TILE.MOUNTAIN;
      if ((x > 21 && y < 12) || (x < 5 && y > 18)) tiles[y][x] = TILE.FOREST;
      if (x === 12 && y > 2 && y < 24) tiles[y][x] = TILE.WATER;
      if (x === 13 && y === 15) tiles[y][x] = TILE.ROAD;
      if (x > 6 && x < 26 && y === 15) tiles[y][x] = TILE.ROAD;
      if (y > 7 && y < 22 && x === 7) tiles[y][x] = TILE.ROAD;
      if (x > 14 && x < 28 && y === 8) tiles[y][x] = TILE.ROAD;
      if (x > 3 && x < 9 && y === 22) tiles[y][x] = TILE.ROAD;
      if (x > 16 && x < 24 && y === 21) tiles[y][x] = TILE.MOUNTAIN;
    }
  }

  for (const [x, y, t] of [
    [7, 15, TILE.TOWN],
    [23, 8, TILE.TOWN],
    [6, 22, TILE.FORT],
    [13, 15, TILE.ROAD],
    [25, 8, TILE.FORT],
  ]) tiles[y][x] = t;

  return tiles;
}

function buildXiaopeiInteriorMap() {
  const width = 16;
  const height = 15;
  const tiles = Array.from({ length: height }, () => Array(width).fill(TILE.ROAD));
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) tiles[y][x] = TILE.MOUNTAIN;
      if ((x > 1 && x < 5 && y > 1 && y < 5) || (x > 9 && x < 14 && y > 1 && y < 5)) tiles[y][x] = TILE.TOWN;
      if (x > 2 && x < 8 && y > 8 && y < 13) tiles[y][x] = TILE.FOREST;
    }
  }
  tiles[14][8] = TILE.ROAD;
  tiles[10][10] = TILE.FORT;
  tiles[4][7] = TILE.TOWN;
  tiles[7][5] = TILE.TOWN;
  return tiles;
}

export const prototypeGameData = Object.freeze({
  schemaVersion: 1,
  maps: Object.freeze({
    province: Object.freeze({
      id: "province",
      name: "徐州近郊（原型）",
      width: 32,
      height: 30,
      start: Object.freeze({ x: 7, y: 16 }),
      tiles: buildProvinceMap(),
      events: Object.freeze({
        "7,15": Object.freeze({ type: "transition", name: "小沛", toMapId: "xiaopei-interior", toX: 8, toY: 13, text: "进入小沛。" }),
        "23,8": Object.freeze({ type: "town", name: "北平", text: "城门紧闭。守军说：虎牢关校尉截断了官道，击败他才能继续北上。" }),
        "6,22": Object.freeze({ type: "boss", bossId: "hulao-commander", flag: "hulaoCleared", name: "虎牢关", text: "虎牢关校尉横刀立马：来者止步！" }),
        "13,15": Object.freeze({ type: "bridge", name: "木桥", text: "河上木桥摇摇欲坠，但还能通行。" }),
        "25,8": Object.freeze({
          type: "objective",
          objectiveId: "rescue-scout",
          flag: "scoutRescued",
          prerequisiteFlag: "hulaoCleared",
          name: "北平南道",
          lockedText: "前方斥候被困，但虎牢关尚未攻破，道路太危险。",
          text: "虎牢关已破。前往北平南道，救回应急斥候。",
          completionText: "斥候获救，带回了北方军情。第二阶段目标完成。",
          reward: Object.freeze({ gold: 90, items: Object.freeze({ "healing-herb": 2 }) }),
        }),
      }),
    }),
    "xiaopei-interior": Object.freeze({
      id: "xiaopei-interior",
      name: "小沛城内（原型）",
      width: 16,
      height: 15,
      start: Object.freeze({ x: 8, y: 13 }),
      evidence: Object.freeze({ status: "prototype", evidenceKind: "town-probe", confidence: 0.2, privateCaptureRef: null }),
      tiles: buildXiaopeiInteriorMap(),
      events: Object.freeze({
        "8,14": Object.freeze({ type: "transition", name: "城门", toMapId: "province", toX: 7, toY: 16, text: "离开小沛，回到徐州近郊。" }),
        "4,7": Object.freeze({ type: "npc", npcId: "xiaopei-elder", name: "小沛长者", text: "听闻虎牢关已破，百姓稍安。若要北上，先在客栈整备兵马。", evidence: Object.freeze({ status: "prototype", evidenceKind: "town-probe", confidence: 0.2 }) }),
        "7,4": Object.freeze({ type: "npc", npcId: "xiaopei-scribe", name: "小沛书记", text: "此城布局仍为原型；待 ROM 证据充足后，会以原版资料替换。", evidence: Object.freeze({ status: "prototype", evidenceKind: "town-probe", confidence: 0.2 }) }),
        "10,10": Object.freeze({ type: "inn", serviceId: "xiaopei-inn", name: "小沛客栈", cost: 30, flag: "xiaopeiInnRested", successText: "一夜休整，众将精神复振。", failureText: "店家摇头：钱粮不足，无法安排客房。", evidence: Object.freeze({ status: "prototype", evidenceKind: "town-probe", confidence: 0.2 }) }),
      }),
    }),
  }),
  officers: Object.freeze([
    Object.freeze({ id: "liu-bei", name: "刘备", soldiers: 420, maxSoldiers: 420, attack: 46, defense: 36, tactics: 18, maxTactics: 18 }),
    Object.freeze({ id: "guan-yu", name: "关羽", soldiers: 510, maxSoldiers: 510, attack: 62, defense: 42, tactics: 10, maxTactics: 10 }),
    Object.freeze({ id: "zhang-fei", name: "张飞", soldiers: 560, maxSoldiers: 560, attack: 68, defense: 38, tactics: 6, maxTactics: 6 }),
  ]),
  items: Object.freeze({
    "healing-herb": Object.freeze({ id: "healing-herb", name: "草药", effect: "heal-soldiers", amount: 180, target: "single-ally" }),
  }),
  enemyGroups: Object.freeze([
    Object.freeze({
      id: "bandits",
      name: "山贼队",
      weight: 4,
      enemies: Object.freeze([
        Object.freeze({ name: "山贼", soldiers: 180, maxSoldiers: 180, attack: 31, defense: 18 }),
        Object.freeze({ name: "喽啰", soldiers: 130, maxSoldiers: 130, attack: 24, defense: 12 }),
      ]),
    }),
    Object.freeze({
      id: "yellow-turbans",
      name: "黄巾余党",
      weight: 3,
      enemies: Object.freeze([
        Object.freeze({ name: "黄巾兵", soldiers: 210, maxSoldiers: 210, attack: 34, defense: 18 }),
        Object.freeze({ name: "黄巾兵", soldiers: 210, maxSoldiers: 210, attack: 34, defense: 18 }),
        Object.freeze({ name: "小头目", soldiers: 260, maxSoldiers: 260, attack: 38, defense: 22 }),
      ]),
    }),
    Object.freeze({
      id: "vanguard",
      name: "敌军先锋",
      weight: 1,
      enemies: Object.freeze([
        Object.freeze({ name: "先锋将", soldiers: 360, maxSoldiers: 360, attack: 48, defense: 30 }),
        Object.freeze({ name: "枪兵", soldiers: 230, maxSoldiers: 230, attack: 37, defense: 20 }),
      ]),
    }),
  ]),
  bossEncounters: Object.freeze({
    "hulao-commander": Object.freeze({
      id: "hulao-commander",
      name: "虎牢关守军",
      enemies: Object.freeze([
        Object.freeze({ name: "守关校尉", soldiers: 620, maxSoldiers: 620, attack: 58, defense: 36 }),
        Object.freeze({ name: "精兵", soldiers: 300, maxSoldiers: 300, attack: 42, defense: 26 }),
        Object.freeze({ name: "精兵", soldiers: 300, maxSoldiers: 300, attack: 42, defense: 26 }),
      ]),
    }),
  }),
  openingText: Object.freeze([
    "中平末年，天下大乱。",
    "你率义军从小沛出发，试图重整山河。",
    "目标：整备队伍，沿官道南下，击破虎牢关守军。",
    "这是高还原复刻的第二阶段：数据边界、存档迁移、物品、目标链与 ROM 管线。",
  ]),
});
