import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  bootstrapChapterBatch,
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

  it("batch bootstrap creates default chapter files, manifests, and summary", async () => {
    const tempRoot = path.join(process.cwd(), ".tmp", `chapter-factory-test-${Date.now()}`);
    await mkdir(tempRoot, { recursive: true });

    const result = await bootstrapChapterBatch(
      {
        chapterId: "chapter-99-bootstrap-test",
        title: "Bootstrap Test Chapter",
        areaLabel: "Bootstrap Test Slice",
        status: "planned",
      },
      {
        chapterDocsDir: path.join(tempRoot, "docs", "chapters"),
        chapterMetadataDir: path.join(tempRoot, "content", "manual", "chapters"),
        chapterReportsDir: path.join(tempRoot, "reports", "chapters", "latest"),
        referenceFramePacksDir: path.join(tempRoot, "content", "reference", "frame-packs"),
        sourceTextDir: path.join(tempRoot, "content", "source", "text"),
        visualBackfillDir: path.join(tempRoot, "content", "manual", "visual-backfill"),
        referenceRootDir: path.join(tempRoot, "content", "reference"),
      },
    );

    expect(result.createdFiles.some((filePath) => filePath.endsWith("chapter-99-bootstrap-test.json"))).toBe(true);
    expect(result.createdFiles.some((filePath) => filePath.endsWith("chapter-99-bootstrap-test-pack.json"))).toBe(true);
    expect(result.createdFiles.some((filePath) => filePath.endsWith("chapter-99-bootstrap-test.source.json"))).toBe(true);
    expect(result.createdDirectories.some((directoryPath) => directoryPath.endsWith(path.join("screenshots", "chapter-99-bootstrap-test")))).toBe(true);

    const summaryText = await readFile(result.summaryPath, "utf8");
    expect(summaryText).toContain("Batch Chapter Bootstrap Summary");
    expect(summaryText).toContain("chapter-99-bootstrap-test");

    const checklistText = await readFile(result.checklistPath, "utf8");
    expect(checklistText).toContain("Lock Checklist");
  });
});
