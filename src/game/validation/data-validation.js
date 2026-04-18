import { tileInfo } from "../tile-types.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const EVIDENCE_STATUSES = new Set(["confirmed", "inferred", "unknown", "prototype"]);

function validateEvidence(evidence, label, required = false) {
  if (!evidence) {
    assert(!required, `${label} missing evidence`);
    return;
  }
  assert(EVIDENCE_STATUSES.has(evidence.status), `${label} invalid evidence status`);
  if (evidence.confidence !== undefined) assert(typeof evidence.confidence === "number" && evidence.confidence >= 0 && evidence.confidence <= 1, `${label} invalid evidence confidence`);
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
    validateEvidence(event.evidence, `event ${coord}`, false);
    if (event.type === "boss") assert(bossIds.has(event.bossId), `event ${coord} missing boss ${event.bossId}`);
    if (event.type === "transition") {
      assert(typeof event.toMapId === "string" && event.toMapId.length > 0, `transition event ${coord} missing toMapId`);
      assert(Number.isInteger(event.toX) && Number.isInteger(event.toY), `transition event ${coord} invalid destination`);
    }
    if (event.type === "npc") {
      assert(typeof event.npcId === "string" && event.npcId.length > 0, `npc event ${coord} missing npcId`);
      assert(typeof event.text === "string" && event.text.length > 0, `npc event ${coord} missing text`);
      validateEvidence(event.evidence, `npc event ${coord}`, true);
    }
    if (event.type === "inn") {
      assert(typeof event.serviceId === "string" && event.serviceId.length > 0, `inn event ${coord} missing serviceId`);
      assert(Number.isInteger(event.cost) && event.cost >= 0, `inn event ${coord} invalid cost`);
      assert(typeof event.flag === "string" && event.flag.length > 0, `inn event ${coord} missing flag`);
      validateEvidence(event.evidence, `inn event ${coord}`, true);
    }
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
  for (const map of mapRecords) validateEvidence(map.evidence, `map ${map.id}`, false);
  const bossIds = new Set(bossRecords.map((boss) => boss.id));
  const itemIds = new Set(itemRecords.map((item) => item.id));
  for (const map of mapRecords) validateMap(map, bossIds, itemIds);
  const mapIds = new Set(mapRecords.map((map) => map.id));
  for (const map of mapRecords) {
    for (const [coord, event] of Object.entries(map.events ?? {})) {
      if (event.type === "transition") {
        assert(mapIds.has(event.toMapId), `transition event ${map.id}:${coord} references missing map ${event.toMapId}`);
        const target = data.maps[event.toMapId];
        assert(event.toX >= 0 && event.toX < target.width && event.toY >= 0 && event.toY < target.height, `transition event ${map.id}:${coord} destination out of bounds`);
      }
    }
  }
  return true;
}
