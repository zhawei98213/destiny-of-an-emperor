import type { ContentDatabase, EventDefinition, FlagStateMap } from "@/types/content";

export interface EventRuntime {
  flags: FlagStateMap;
  dialogueLog: string[];
  openedShopIds: string[];
  startedBattleGroupIds: string[];
  ended: boolean;
}

export function createEventRuntime(): EventRuntime {
  return {
    flags: {},
    dialogueLog: [],
    openedShopIds: [],
    startedBattleGroupIds: [],
    ended: false,
  };
}

export class EventInterpreter {
  execute(event: EventDefinition, database: ContentDatabase, runtime: EventRuntime): EventRuntime {
    for (const command of event.steps) {
      if (runtime.ended) {
        break;
      }

      switch (command.type) {
        case "dialogue":
          {
            const line = database.dialogueLines.find((entry) => entry.id === command.lineId);
            if (!line) {
              throw new Error(
                `[event] ${event.id}: missing dialogue line "${command.lineId}" during execution`,
              );
            }

            runtime.dialogueLog.push(`${line.speakerName}: ${line.text}`);
          }
          break;
        case "setFlag":
          runtime.flags[command.flagId] = command.value;
          break;
        case "openShop":
          runtime.openedShopIds.push(command.shopId);
          break;
        case "startBattle":
          runtime.startedBattleGroupIds.push(command.battleGroupId);
          break;
        case "end":
          runtime.ended = true;
          break;
      }
    }

    return runtime;
  }
}
