import { tileInfo } from "../tile-types.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertUniqueIds(records, label) {
  const seen = new Set();
  for (const record of records) {
    assert(record && typeof record.id === "string" && record.id.length > 0, `${label} record missing id`);
    assert(!seen.has(record.id), `${label} duplicate id: ${record.id}`);
    seen.add(record.id);
  }
}

function validateMap(map, bossIds, itemIds) {
  assert(Number.isInteger(map.width) && map.width > 0, `map ${map.id} invalid width`);
  assert(Number.isInteger(map.height) && map.height > 0, `map ${map.id} invalid height`);
  assert(Array.isArray(map.tiles) && map.tiles.length === map.height, `map ${map.id} height mismatch`);
  for (const [rowIndex, row] of map.tiles.entries()) {
    assert(Array.isArray(row) && row.length === map.width, `map ${map.id} row ${rowIndex} width mismatch`);
    for (const tile of row) assert(tileInfo[tile], `map ${map.id} unknown tile ${tile}`);
  }
  assert(map.start && Number.isInteger(map.start.x) && Number.isInteger(map.start.y), `map ${map.id} invalid start`);
  assert(map.start.x >= 0 && map.start.x < map.width && map.start.y >= 0 && map.start.y < map.height, `map ${map.id} start out of bounds`);

  for (const [coord, event] of Object.entries(map.events ?? {})) {
    const [x, y] = coord.split(",").map(Number);
    assert(Number.isInteger(x) && Number.isInteger(y), `map ${map.id} event ${coord} invalid coordinate`);
    assert(x >= 0 && x < map.width && y >= 0 && y < map.height, `map ${map.id} event ${coord} out of bounds`);
    if (event.type === "boss") assert(bossIds.has(event.bossId), `event ${coord} missing boss ${event.bossId}`);
    if (event.type === "objective") {
      assert(typeof event.objectiveId === "string" && event.objectiveId.length > 0, `objective event ${coord} missing objectiveId`);
      assert(typeof event.flag === "string" && event.flag.length > 0, `objective event ${coord} missing flag`);
      for (const itemId of Object.keys(event.reward?.items ?? {})) {
        assert(itemIds.has(itemId), `objective event ${coord} references missing item ${itemId}`);
      }
    }
  }
}

export function validateGameData(data) {
  assert(data && data.schemaVersion === 1, "game data schemaVersion must be 1");
  const mapRecords = Object.values(data.maps ?? {});
  const bossRecords = Object.values(data.bossEncounters ?? {});
  const itemRecords = Object.values(data.items ?? {});
  assertUniqueIds(mapRecords, "map");
  assertUniqueIds(data.officers ?? [], "officer");
  assertUniqueIds(data.enemyGroups ?? [], "enemy group");
  assertUniqueIds(bossRecords, "boss");
  assertUniqueIds(itemRecords, "item");
  const bossIds = new Set(bossRecords.map((boss) => boss.id));
  const itemIds = new Set(itemRecords.map((item) => item.id));
  for (const map of mapRecords) validateMap(map, bossIds, itemIds);
  return true;
}
