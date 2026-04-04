import { describe, expect, it } from "vitest";
import { buildAudioWorkflowReport } from "../../tools/lib/audioWorkflow";

describe("audioWorkflow", () => {
  it("reports structured chapter audio mappings", async () => {
    const report = await buildAudioWorkflowReport();

    expect(report.chapterMappings.some((entry) => entry.chapterId === "chapter-05-highland-waystation")).toBe(true);
    expect(report.issues.length).toBe(0);
  });
});
