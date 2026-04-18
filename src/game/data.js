import { prototypeGameData } from "./generated/prototype-data.js";
import { TILE, tileInfo } from "./tile-types.js";

export { TILE, tileInfo };

export const gameData = prototypeGameData;
export const maps = gameData.maps;
export const officers = gameData.officers;
export const items = gameData.items;
export const enemyGroups = gameData.enemyGroups;
export const bossEncounters = gameData.bossEncounters;
export const openingText = gameData.openingText;
