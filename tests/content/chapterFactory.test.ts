import { describe, expect, it } from "vitest";
import {
  buildChapterImportStatusReport,
  buildChapterLockChecklist,
  formatChapterImportStatusReport,
} from "../../tools/lib/chapterFactory";

describe("chapter factory tooling", () => {
  it("builds a chapter status report from current chapter metadata and reports", async () => {
    const report = await buildChapterImportStatusReport();

    expect(report.chapters.length).toBeGreaterThanOrEqual(3);
    expect(report.chapters.some((entry) => entry.chapterId === "chapter-01-lou-sang")).toBe(true);
    expect(report.chapters.some((entry) => entry.chapterId === "chapter-03-river-ford")).toBe(true);
    expect(formatChapterImportStatusReport(report)).toContain("Chapter Import Status Report");
  });

  it("builds a lock checklist for a real chapter", async () => {
    const checklist = await buildChapterLockChecklist("chapter-03-river-ford");

    expect(checklist.items.length).toBeGreaterThanOrEqual(8);
    expect(checklist.items.some((entry) => entry.label.includes("Regression cases are bound"))).toBe(true);
    expect(checklist.items.some((entry) => entry.label.includes("UI parity"))).toBe(true);
  });
});
