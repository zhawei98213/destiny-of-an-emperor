import { useItem } from "./items.js";

export function useBattleItemCommand(state, battle, itemId = "healing-herb") {
  const result = useItem(state, itemId);
  battle.log.push(result.message);
  return result;
}
