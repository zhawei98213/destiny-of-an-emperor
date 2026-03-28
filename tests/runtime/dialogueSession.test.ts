import { describe, expect, it } from "vitest";
import { DialogueSession } from "@/ui/dialogueSession";
import type { DialogueCue } from "@/types/content";

function createCue(text: string): DialogueCue {
  return {
    id: text,
    speakerName: "Guide",
    text,
    choices: undefined,
  };
}

describe("dialogue session", () => {
  it("reveals text over time and can skip to the full line", () => {
    const session = new DialogueSession([createCue("Welcome")], 4);

    const partialView = session.update(500, false);
    expect(partialView?.visibleText).toBe("We");
    expect(partialView?.isLineComplete).toBe(false);

    const skippedView = session.advance();
    expect(skippedView?.visibleText).toBe("Welcome");
    expect(skippedView?.isLineComplete).toBe(true);
  });

  it("accumulates small frame deltas into visible characters", () => {
    const session = new DialogueSession([createCue("Hello")], 48);

    for (let index = 0; index < 2; index += 1) {
      session.update(16, false);
    }

    expect(session.getView()?.visibleText).toBe("H");
  });

  it("advances across multiple lines and completes at the end", () => {
    const session = new DialogueSession([createCue("Hello"), createCue("Again")], 30);

    session.advance();
    const nextView = session.advance();
    expect(nextView?.cue.id).toBe("Again");
    expect(nextView?.visibleText).toBe("");

    session.advance();
    const completeView = session.advance();
    expect(completeView?.isComplete).toBe(true);
    expect(session.isActive()).toBe(false);
  });
});
