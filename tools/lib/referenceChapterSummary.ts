import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadAllChapterMetadata } from "./chapterMetadata";
import { repoRoot, stableStringify } from "./importerCore";
import { buildReferenceIndex, loadReferenceManifest, queryReferenceEntries } from "./referencePipeline";

const manualChapterDir = path.join(repoRoot, "content", "manual", "chapters");
const reportDir = path.join(repoRoot, "reports", "reference", "latest");

export interface ChapterReferenceCategorySummary {
  required: string[];
  covered: string[];
  missing: string[];
}

export interface ChapterReferenceSummaryEntry {
  chapterId: string;
  title: string;
  categories: {
    maps: ChapterReferenceCategorySummary;
    npcs: ChapterReferenceCategorySummary;
    ui: ChapterReferenceCategorySummary;
    battles: ChapterReferenceCategorySummary;
  };
}

export interface ChapterReferenceSummaryReport {
  generatedAt: string;
  chapters: ChapterReferenceSummaryEntry[];
  backlog: Array<{
    chapterId: string;
    category: "maps" | "npcs" | "ui" | "battles";
    subjectIds: string[];
  }>;
}

function unique(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function summarize(required: string[], coveredEntries: string[]): ChapterReferenceCategorySummary {
  const requiredUnique = unique(required);
  const coveredUnique = unique(coveredEntries.filter((entry) => requiredUnique.includes(entry)));
  return {
    required: requiredUnique,
    covered: coveredUnique,
    missing: requiredUnique.filter((entry) => !coveredUnique.includes(entry)),
  };
}

export async function buildChapterReferenceSummaryReport(): Promise<ChapterReferenceSummaryReport> {
  const chapters = (await loadAllChapterMetadata(manualChapterDir))
    .filter((entry) => /^chapter-0[1-4]-/.test(entry.chapterId))
    .sort((left, right) => left.chapterId.localeCompare(right.chapterId));
  const index = buildReferenceIndex(await loadReferenceManifest());

  const chapterEntries: ChapterReferenceSummaryEntry[] = chapters.map((chapter) => {
    const chapterRefs = queryReferenceEntries(index, { chapter: chapter.chapterId });

    const mapCovered = chapterRefs
      .filter((entry) => entry.subject_type === "map")
      .map((entry) => entry.subject_id);
    const npcCovered = chapterRefs
      .filter((entry) => entry.subject_type === "npc")
      .map((entry) => entry.subject_id);
    const uiCovered = chapterRefs
      .filter((entry) => entry.subject_type === "ui")
      .map((entry) => entry.subject_id);
    const battleCovered = chapterRefs
      .filter((entry) => entry.subject_type === "battle")
      .map((entry) => entry.subject_id);

    return {
      chapterId: chapter.chapterId,
      title: chapter.title,
      categories: {
        maps: summarize(chapter.maps, mapCovered),
        npcs: summarize(chapter.npcs, npcCovered),
        ui: summarize(["dialogue-box", "menu-overlay", ...(chapter.shops.length > 0 ? ["shop-overlay"] : []), ...(chapter.enemyGroups.length > 0 ? ["battle-panel"] : [])], uiCovered),
        battles: summarize(chapter.enemyGroups, battleCovered),
      },
    };
  });

  const backlog = chapterEntries.flatMap((chapter) => {
    const categoryEntries: Array<{ category: "maps" | "npcs" | "ui" | "battles"; subjectIds: string[] }> = [
      { category: "maps", subjectIds: chapter.categories.maps.missing },
      { category: "npcs", subjectIds: chapter.categories.npcs.missing },
      { category: "ui", subjectIds: chapter.categories.ui.missing },
      { category: "battles", subjectIds: chapter.categories.battles.missing },
    ];
    return categoryEntries
      .filter((entry) => entry.subjectIds.length > 0)
      .map((entry) => ({
        chapterId: chapter.chapterId,
        category: entry.category,
        subjectIds: entry.subjectIds,
      }));
  });

  return {
    generatedAt: new Date().toISOString(),
    chapters: chapterEntries,
    backlog,
  };
}

export async function writeChapterReferenceSummaryReport(report: ChapterReferenceSummaryReport): Promise<string> {
  await mkdir(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, "chapter-summary.json");
  const summaryPath = path.join(reportDir, "chapter-summary.md");

  await writeFile(reportPath, `${stableStringify(report)}\n`, "utf8");

  const lines = [
    "# Chapter Reference Summary",
    "# 章节参考资料摘要",
    "",
    `Generated At / 生成时间: ${report.generatedAt}`,
    "",
    "| Chapter | Maps | NPCs | UI | Battles |",
    "| --- | --- | --- | --- | --- |",
    ...report.chapters.map((chapter) => `| ${chapter.chapterId} | ${chapter.categories.maps.covered.length}/${chapter.categories.maps.required.length} | ${chapter.categories.npcs.covered.length}/${chapter.categories.npcs.required.length} | ${chapter.categories.ui.covered.length}/${chapter.categories.ui.required.length} | ${chapter.categories.battles.covered.length}/${chapter.categories.battles.required.length} |`),
    "",
    "## Missing Backlog",
    "## 缺失 Backlog",
    "",
    ...(report.backlog.length === 0
      ? ["- none / 无"]
      : report.backlog.map((entry) => `- ${entry.chapterId} :: ${entry.category} -> ${entry.subjectIds.join(", ")}`)),
    "",
  ];
  await writeFile(summaryPath, `${lines.join("\n")}\n`, "utf8");
  return reportPath;
}
