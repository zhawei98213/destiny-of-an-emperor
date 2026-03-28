import { describe, expect, it } from "vitest";
import { createDialogueCue, createEventRuntime, EventInterpreter } from "@/systems/eventInterpreter";
import type { ContentDatabase, EventDefinition } from "@/types/content";

describe("event interpreter", () => {
  it("executes dialogue, setFlag, and end", () => {
    const interpreter = new EventInterpreter();
    const runtime = createEventRuntime();
    const event: EventDefinition = {
      id: "intro",
      name: "Intro",
      steps: [
        { type: "dialogue", lineId: "line-1" },
        { type: "setFlag", flagId: "introSeen", value: true },
        { type: "end" },
        { type: "dialogue", lineId: "line-2" },
      ],
    };
    const database: ContentDatabase = {
      packs: [],
      maps: [],
      dialogueLines: [
        { id: "line-1", speakerName: "Narrator", text: "Welcome", portraitId: "narrator", soundId: "blip" },
        { id: "line-2", speakerName: "Narrator", text: "Skipped" },
      ],
      events: [event],
      items: [],
      partyMembers: [],
      enemies: [],
      battleGroups: [],
      shops: [],
      skills: [],
      flags: [],
      questStates: [],
    };

    interpreter.execute(event, database, runtime);

    expect(runtime.dialogueLog).toEqual([{
      id: "line-1",
      speakerName: "Narrator",
      speakerNpcId: undefined,
      text: "Welcome",
      portraitId: "narrator",
      soundId: "blip",
      choices: undefined,
    }]);
    expect(runtime.flags.introSeen).toBe(true);
    expect(runtime.ended).toBe(true);
  });

  it("creates structured dialogue cues with extension fields", () => {
    const event: EventDefinition = {
      id: "intro",
      name: "Intro",
      steps: [],
    };
    const database: ContentDatabase = {
      packs: [],
      maps: [],
      dialogueLines: [
        {
          id: "line-1",
          speakerName: "Guide",
          speakerNpcId: "npc-1",
          text: "Welcome to town.",
          portraitId: "guide-default",
          soundId: "voice-guide",
        },
      ],
      events: [],
      items: [],
      partyMembers: [],
      enemies: [],
      battleGroups: [],
      shops: [],
      skills: [],
      flags: [],
      questStates: [],
    };

    expect(createDialogueCue(database, event, "line-1")).toEqual({
      id: "line-1",
      speakerName: "Guide",
      speakerNpcId: "npc-1",
      text: "Welcome to town.",
      portraitId: "guide-default",
      soundId: "voice-guide",
      choices: undefined,
    });
  });
});
