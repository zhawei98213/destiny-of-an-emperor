import { describe, expect, it } from "vitest";
import {
  buildChapterNpcTextCompletenessReport,
  buildDialogueTableImportReport,
  buildEventTextLinkageReport,
  buildNpcPlacementImportReport,
  buildSpeakerMetadataReport,
} from "../../tools/lib/npcDialogueImportHelpers";

describe("npc dialogue import helpers", () => {
  it("builds chapter-06 npc placement and dialogue import reports", async () => {
    const npcReport = await buildNpcPlacementImportReport("chapter-06-border-fort");
    const dialogueReport = await buildDialogueTableImportReport(
      "content/source/text/chapter-06-border-fort.source.json",
      "chapter-06-border-fort",
    );

    expect(npcReport.summary.sourceNpcCount).toBe(4);
    expect(npcReport.issues.filter((issue) => issue.severity === "error")).toEqual([]);
    expect(npcReport.rows.some((row) => row.npcId === "border-sentry" && row.eventId === "border-sentry-event")).toBe(true);

    expect(dialogueReport.summary.sourceDialogueCount).toBe(7);
    expect(dialogueReport.summary.sourceEventCount).toBe(5);
    expect(dialogueReport.summary.missingCount).toBe(0);
    expect(dialogueReport.summary.mismatchCount).toBe(0);
  });

  it("checks chapter-06 event linkage, speaker metadata, and chapter completeness", async () => {
    const linkageReport = await buildEventTextLinkageReport({
      chapterId: "chapter-06-border-fort",
      sourceFilePath: "content/source/text/chapter-06-border-fort.source.json",
    });
    const speakerReport = await buildSpeakerMetadataReport({
      chapterId: "chapter-06-border-fort",
      sourceFilePath: "content/source/text/chapter-06-border-fort.source.json",
    });
    const completenessReport = await buildChapterNpcTextCompletenessReport();

    expect(linkageReport.issues.filter((issue) => issue.severity === "error")).toEqual([]);
    expect(speakerReport.issues).toEqual([]);

    const chapterSix = completenessReport.chapters.find((entry) => entry.chapterId === "chapter-06-border-fort");
    expect(chapterSix?.status).toBe("ready");
    expect(chapterSix?.sourceDialogueCount).toBe(7);
    expect(chapterSix?.sourceEventCount).toBe(5);
    expect(chapterSix?.referencedDialogueCount).toBe(7);
  });
});
