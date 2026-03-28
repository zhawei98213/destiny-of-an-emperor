import type { ContentDatabase, DialogueCue, EventDefinition, FlagStateMap } from "@/types/content";

export interface EventRuntime {
  flags: FlagStateMap;
  dialogueLog: DialogueCue[];
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

export function createDialogueCue(
  database: ContentDatabase,
  event: EventDefinition,
  lineId: string,
): DialogueCue {
  const line = database.dialogueLines.find((entry) => entry.id === lineId);
  if (!line) {
    throw new Error(
      `[event] ${event.id}: missing dialogue line "${lineId}" during execution`,
    );
  }

  return {
    id: line.id,
    speakerName: line.speakerName,
    speakerNpcId: line.speakerNpcId,
    text: line.text,
    portraitId: line.portraitId,
    soundId: line.soundId,
    choices: undefined,
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
          runtime.dialogueLog.push(createDialogueCue(database, event, command.lineId));
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
