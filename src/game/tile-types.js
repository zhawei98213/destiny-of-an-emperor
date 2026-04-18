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
