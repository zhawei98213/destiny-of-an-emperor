import { items } from "./data.js";
import { living } from "./state.js";

export function itemQuantity(state, itemId) {
  return state.inventory?.[itemId] ?? 0;
}

export function addItems(state, rewards = {}) {
  state.inventory ??= {};
  for (const [itemId, amount] of Object.entries(rewards)) {
    state.inventory[itemId] = itemQuantity(state, itemId) + amount;
  }
}

export function firstWoundedAlly(state) {
  return state.party.find((unit) => unit.soldiers > 0 && unit.soldiers < unit.maxSoldiers) ?? living(state.party)[0] ?? state.party[0];
}

export function useItem(state, itemId, target = firstWoundedAlly(state)) {
  const item = items[itemId];
  if (!item) return { ok: false, message: "未知物品。" };
  if (itemQuantity(state, itemId) <= 0) return { ok: false, message: `${item.name} 已经用完。` };
  if (!target || target.soldiers <= 0) return { ok: false, message: "没有可用目标。" };

  if (item.effect === "heal-soldiers") {
    const before = target.soldiers;
    target.soldiers = Math.min(target.maxSoldiers, target.soldiers + item.amount);
    const healed = target.soldiers - before;
    if (healed <= 0) return { ok: false, message: `${target.name} 不需要恢复。` };
    state.inventory[itemId] -= 1;
    return { ok: true, item, target, healed, message: `${target.name} 使用${item.name}，恢复 ${healed} 兵。` };
  }

  return { ok: false, message: `${item.name} 暂无可用效果。` };
}

export function inventoryLines(state) {
  const entries = Object.entries(state.inventory ?? {}).filter(([, quantity]) => quantity > 0);
  if (entries.length === 0) return ["没有可用物品。"];
  return entries.map(([itemId, quantity]) => `${items[itemId]?.name ?? itemId} × ${quantity}`);
}
