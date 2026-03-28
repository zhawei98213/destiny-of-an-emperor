import { describe, expect, it } from "vitest";
import { createEventRuntime, EventInterpreter } from "@/systems/eventInterpreter";

describe("event interpreter", () => {
  it("executes dialogue, setFlag, and end", () => {
    const interpreter = new EventInterpreter();
    const runtime = createEventRuntime();

    interpreter.execute(
      [
        { type: "dialogue", speaker: "Narrator", text: "Welcome" },
        { type: "setFlag", flag: "introSeen", value: true },
        { type: "end" },
        { type: "dialogue", speaker: "Narrator", text: "Skipped" },
      ],
      runtime,
    );

    expect(runtime.dialogueLog).toEqual(["Narrator: Welcome"]);
    expect(runtime.flags.introSeen).toBe(true);
    expect(runtime.ended).toBe(true);
  });
});
