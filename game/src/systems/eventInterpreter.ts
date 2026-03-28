import type { EventCommand, FlagMap } from "@/types/content";

export interface EventRuntime {
  flags: FlagMap;
  dialogueLog: string[];
  ended: boolean;
}

export function createEventRuntime(): EventRuntime {
  return {
    flags: {},
    dialogueLog: [],
    ended: false,
  };
}

export class EventInterpreter {
  execute(commands: EventCommand[], runtime: EventRuntime): EventRuntime {
    for (const command of commands) {
      if (runtime.ended) {
        break;
      }

      switch (command.type) {
        case "dialogue":
          runtime.dialogueLog.push(`${command.speaker}: ${command.text}`);
          break;
        case "setFlag":
          runtime.flags[command.flag] = command.value;
          break;
        case "end":
          runtime.ended = true;
          break;
      }
    }

    return runtime;
  }
}
