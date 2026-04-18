import { addItems } from "./items.js";

export function applyObjectiveEvent(state, event) {
  if (event.prerequisiteFlag && !state.flags[event.prerequisiteFlag]) {
    return { status: "locked", lines: [event.name, event.lockedText] };
  }
  if (state.flags[event.flag]) {
    return { status: "already-complete", lines: [event.name, "斥候已经安全归队，北方情报已送回营中。"] };
  }

  state.flags[event.flag] = true;
  state.objectives.completed = [...new Set([...(state.objectives.completed ?? []), event.objectiveId])];
  state.objectives.active = null;
  state.gold += event.reward?.gold ?? 0;
  addItems(state, event.reward?.items ?? {});

  return {
    status: "completed",
    lines: [event.name, event.text, event.completionText, `获得 ${event.reward?.gold ?? 0} 金与草药补给。`],
  };
}
