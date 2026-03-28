import { describe, expect, it } from "vitest";
import { createEventRuntime, EventInterpreter } from "@/systems/eventInterpreter";
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
        { id: "line-1", speakerName: "Narrator", text: "Welcome" },
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

    expect(runtime.dialogueLog).toEqual(["Narrator: Welcome"]);
    expect(runtime.flags.introSeen).toBe(true);
    expect(runtime.ended).toBe(true);
  });
});
