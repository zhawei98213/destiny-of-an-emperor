export const TILE = Object.freeze({
  GRASS: 0,
  FOREST: 1,
  MOUNTAIN: 2,
  WATER: 3,
  ROAD: 4,
  TOWN: 5,
  FORT: 6,
});

export const tileInfo = Object.freeze({
  [TILE.GRASS]: { name: "平原", passable: true, encounter: 1.0, colors: ["#5aa348", "#3d7d34"] },
  [TILE.FOREST]: { name: "森林", passable: true, encounter: 1.35, colors: ["#2e7d3c", "#1f5b2f"] },
  [TILE.MOUNTAIN]: { name: "山脉", passable: false, encounter: 0, colors: ["#8d8274", "#5f554f"] },
  [TILE.WATER]: { name: "河流", passable: false, encounter: 0, colors: ["#3574be", "#224d85"] },
  [TILE.ROAD]: { name: "官道", passable: true, encounter: 0.45, colors: ["#c39b57", "#94723e"] },
  [TILE.TOWN]: { name: "城镇", passable: true, encounter: 0, colors: ["#b85b3a", "#7d3422"] },
  [TILE.FORT]: { name: "关隘", passable: true, encounter: 0, colors: ["#8b4b34", "#4f2b20"] },
});

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
  ]) tiles[y][x] = t;

  return tiles.map((row) => row.join(",")).join("\n");
}

function parseTiles(text) {
  return text.trim().split("\n").map((line) => line.split(",").map(Number));
}

export const maps = Object.freeze({
  province: {
    id: "province",
    name: "徐州近郊（原型）",
    width: 32,
    height: 30,
    start: { x: 7, y: 16 },
    tiles: parseTiles(buildProvinceMap()),
    events: Object.freeze({
      "7,15": { type: "rest-town", name: "小沛", text: "小沛城中人心惶惶，百姓盼望义军安定四方。你在城中休整，兵力与计策恢复。" },
      "23,8": { type: "town", name: "北平", text: "城门紧闭。守军说：虎牢关校尉截断了官道，击败他才能继续北上。" },
      "6,22": { type: "boss", bossId: "hulao-commander", flag: "hulaoCleared", name: "虎牢关", text: "虎牢关校尉横刀立马：来者止步！" },
      "13,15": { type: "bridge", name: "木桥", text: "河上木桥摇摇欲坠，但还能通行。" },
    }),
  },
});

export const officers = Object.freeze([
  { id: "liu-bei", name: "刘备", soldiers: 420, maxSoldiers: 420, attack: 46, defense: 36, tactics: 18, maxTactics: 18 },
  { id: "guan-yu", name: "关羽", soldiers: 510, maxSoldiers: 510, attack: 62, defense: 42, tactics: 10, maxTactics: 10 },
  { id: "zhang-fei", name: "张飞", soldiers: 560, maxSoldiers: 560, attack: 68, defense: 38, tactics: 6, maxTactics: 6 },
]);

export const enemyGroups = Object.freeze([
  {
    id: "bandits",
    name: "山贼队",
    weight: 4,
    enemies: [
      { name: "山贼", soldiers: 180, maxSoldiers: 180, attack: 31, defense: 18 },
      { name: "喽啰", soldiers: 130, maxSoldiers: 130, attack: 24, defense: 12 },
    ],
  },
  {
    id: "yellow-turbans",
    name: "黄巾余党",
    weight: 3,
    enemies: [
      { name: "黄巾兵", soldiers: 210, maxSoldiers: 210, attack: 34, defense: 18 },
      { name: "黄巾兵", soldiers: 210, maxSoldiers: 210, attack: 34, defense: 18 },
      { name: "小头目", soldiers: 260, maxSoldiers: 260, attack: 38, defense: 22 },
    ],
  },
  {
    id: "vanguard",
    name: "敌军先锋",
    weight: 1,
    enemies: [
      { name: "先锋将", soldiers: 360, maxSoldiers: 360, attack: 48, defense: 30 },
      { name: "枪兵", soldiers: 230, maxSoldiers: 230, attack: 37, defense: 20 },
    ],
  },
]);

export const bossEncounters = Object.freeze({
  "hulao-commander": {
    id: "hulao-commander",
    name: "虎牢关守军",
    enemies: [
      { name: "守关校尉", soldiers: 620, maxSoldiers: 620, attack: 58, defense: 36 },
      { name: "精兵", soldiers: 300, maxSoldiers: 300, attack: 42, defense: 26 },
      { name: "精兵", soldiers: 300, maxSoldiers: 300, attack: 42, defense: 26 },
    ],
  },
});

export const openingText = [
  "中平末年，天下大乱。",
  "你率义军从小沛出发，试图重整山河。",
  "目标：整备队伍，沿官道南下，击破虎牢关守军。",
  "这是高还原复刻的第一阶段：地图、菜单、遭遇战、Boss 与数据管线。",
];
