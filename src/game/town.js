import { maps } from "./data.js";
import { restoreParty } from "./state.js";

export function applyTransitionEvent(state, event) {
  if (!maps[event.toMapId]) return { ok: false, lines: [event.name, "道路尚未开放。"] };
  state.mapId = event.toMapId;
  state.player = { x: event.toX, y: event.toY, dir: "down" };
  return { ok: true, lines: [event.name, event.text] };
}

export function applyInnEvent(state, event) {
  if (state.gold < event.cost) {
    return { ok: false, status: "insufficient-gold", lines: [event.name, event.failureText] };
  }
  state.gold -= event.cost;
  restoreParty(state);
  state.flags[event.flag] = true;
  return { ok: true, status: "rested", lines: [event.name, `${event.cost} 金を支払い休息した。`, event.successText] };
}

export function npcDialogue(event) {
  return { ok: true, lines: [event.name, event.text] };
}
