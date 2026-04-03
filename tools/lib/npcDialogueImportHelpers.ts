import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ChapterMetadata } from "./chapterMetadata";
import {
  loadManualStoryContent,
  loadManualWorldContent,
  loadRealChapterMetadata,
} from "./manualContent";
import {
  formatError,
  repoRoot,
  stableStringify,
} from "./importerCore";
import { loadMapSource, loadTextSource, type MapSourceDocument, type TextSourceDocument } from "./sourceSchemas";

export type HelperSeverity = "error" | "warning";

export interface HelperIssue {
  severity: HelperSeverity;
  path: string;
  message: string;
  chapterId?: string;
  mapId?: string;
  npcId?: string;
  lineId?: string;
  eventId?: string;
}

export interface NpcPlacementImportRow {
  chapterId: string;
  mapId: string;
  npcId: string;
  name: string;
  x: number;
  y: number;
  facing: string;
  sprite?: string;
  behavior?: string;
  sourcePath: string;
  manualPath?: string;
  triggerId?: string;
  eventId?: string;
}

export interface NpcPlacementImportReport {
  generatedAt: string;
  chapterId: string;
  sourceMapFiles: string[];
  rows: NpcPlacementImportRow[];
  issues: HelperIssue[];
  summary: {
    mapCount: number;
    sourceNpcCount: number;
    manualNpcCount: number;
    issueCount: number;
  };
}

export interface DialogueImportRow {
  kind: "dialogue" | "event";
  id: string;
  sourcePath: string;
  manualPath?: string;
  chapterEvent: boolean;
  status: "matched" | "missing-in-manual" | "mismatch";
}

export interface DialogueTableImportReport {
  generatedAt: string;
  chapterId?: string;
  sourceFile: string;
  rows: DialogueImportRow[];
  issues: HelperIssue[];
  summary: {
    sourceDialogueCount: number;
    sourceEventCount: number;
    matchedCount: number;
    missingCount: number;
    mismatchCount: number;
  };
}

export interface EventTextLinkageReport {
  generatedAt: string;
  chapterId?: string;
  sourceFile?: string;
  checkedEventCount: number;
  issues: HelperIssue[];
}

export interface SpeakerMetadataReport {
  generatedAt: string;
  chapterId?: string;
  sourceFile?: string;
  checkedLineCount: number;
  issues: HelperIssue[];
}

export interface ChapterNpcTextCoverage {
  chapterId: string;
  title: string;
  sourceMapCount: number;
  sourceNpcCount: number;
  manualNpcCount: number;
  chapterNpcCount: number;
  sourceTextFile?: string;
  sourceDialogueCount: number;
  sourceEventCount: number;
  referencedDialogueCount: number;
  npcIssueCount: number;
  linkageIssueCount: number;
  speakerIssueCount: number;
  status: "ready" | "partial" | "missing-source";
}

export interface ChapterNpcTextCompletenessReport {
  generatedAt: string;
  summary: {
    chapterCount: number;
    readyCount: number;
    partialCount: number;
    missingSourceCount: number;
    issueCount: number;
  };
  chapters: ChapterNpcTextCoverage[];
  issues: HelperIssue[];
}

interface SourceMapEntry {
  filePath: string;
  document: MapSourceDocument;
}

function relative(filePath: string): string {
  return path.relative(repoRoot, filePath);
}

function sourceTextPathForChapter(chapterId: string): string {
  return path.join(repoRoot, "content", "source", "text", `${chapterId}.source.json`);
}

async function loadSourceMapEntries(): Promise<SourceMapEntry[]> {
  const sourceDir = path.join(repoRoot, "content", "source", "maps");
  const fileNames = (await readdir(sourceDir, { withFileTypes: true }))
    .map((entry) => entry.name)
    .filter((fileName) => fileName.endsWith(".source.json"))
    .sort();
  return Promise.all(fileNames.map(async (fileName) => {
    const filePath = path.join(sourceDir, fileName);
    return {
      filePath,
      document: await loadMapSource(filePath),
    };
  }));
}

async function loadSourceMapIndex(): Promise<Map<string, { filePath: string; map: MapSourceDocument["maps"][number]; mapIndex: number }>> {
  const entries = await loadSourceMapEntries();
  const index = new Map<string, { filePath: string; map: MapSourceDocument["maps"][number]; mapIndex: number }>();
  entries.forEach(({ filePath, document }) => {
    document.maps.forEach((map, mapIndex) => {
      index.set(map.id, { filePath, map, mapIndex });
    });
  });
  return index;
}

function findChapter(chapters: ChapterMetadata[], chapterId: string): ChapterMetadata {
  const chapter = chapters.find((entry) => entry.chapterId === chapterId);
  if (!chapter) {
    throw new Error(`[npc-dialogue] unknown chapter "${chapterId}"`);
  }
  return chapter;
}

function compareUnknown(left: unknown, right: unknown): boolean {
  return stableStringify(left) === stableStringify(right);
}

function collectDialogueLineIds(
  steps: Array<Record<string, unknown>>,
  eventId: string,
  issues: HelperIssue[],
  basePath: string,
  knownLineIds: Set<string>,
  lineIds: Set<string>,
  chapterId?: string,
): void {
  steps.forEach((step, index) => {
    const stepPath = `${basePath}[${index}]`;
    if (step.type === "dialogue") {
      const lineId = typeof step.lineId === "string" ? step.lineId : undefined;
      if (!lineId || !knownLineIds.has(lineId)) {
        issues.push({
          severity: "error",
          path: `${stepPath}.lineId`,
          message: `event "${eventId}" references missing dialogue line "${lineId ?? "undefined"}"`,
          chapterId,
          eventId,
          lineId,
        });
      } else {
        lineIds.add(lineId);
      }
    }

    if (Array.isArray(step.steps)) {
      collectDialogueLineIds(
        step.steps as Array<Record<string, unknown>>,
        eventId,
        issues,
        `${stepPath}.steps`,
        knownLineIds,
        lineIds,
        chapterId,
      );
    }
  });
}

function buildChapterNpcSet(
  world: Awaited<ReturnType<typeof loadManualWorldContent>>,
  chapter: ChapterMetadata,
): Set<string> {
  const set = new Set<string>();
  world.maps
    .filter((map) => chapter.maps.includes(map.id))
    .forEach((map) => {
      map.npcs.forEach((npc) => {
        set.add(npc.id);
      });
    });
  return set;
}

async function writeReportArtifacts<T>(category: string, fileName: string, report: T): Promise<string> {
  const reportDir = path.join(repoRoot, "reports", "npc-dialogue", "latest");
  await mkdir(reportDir, { recursive: true });
  const targetPath = path.join(reportDir, `${category}.${fileName}.json`);
  await writeFile(targetPath, `${stableStringify(report)}\n`, "utf8");
  return targetPath;
}

function fileStem(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  const lastSegment = normalized.split("/").at(-1) ?? normalized;
  return lastSegment.replace(/\.source\.json$/, "").replace(/\.json$/, "");
}

export async function buildNpcPlacementImportReport(chapterId: string): Promise<NpcPlacementImportReport> {
  const [chapters, world, sourceMapIndex] = await Promise.all([
    loadRealChapterMetadata(),
    loadManualWorldContent(),
    loadSourceMapIndex(),
  ]);

  const chapter = findChapter(chapters, chapterId);
  const worldMapIndex = new Map(world.maps.map((map) => [map.id, map]));
  const issues: HelperIssue[] = [];
  const rows: NpcPlacementImportRow[] = [];
  const sourceMapFiles = new Set<string>();

  chapter.maps.forEach((mapId) => {
    const sourceEntry = sourceMapIndex.get(mapId);
    if (!sourceEntry) {
      issues.push({
        severity: "error",
        chapterId,
        mapId,
        path: `content/source/maps:${mapId}`,
        message: `chapter map "${mapId}" is missing from source map documents`,
      });
      return;
    }

    sourceMapFiles.add(relative(sourceEntry.filePath));
    const manualMap = worldMapIndex.get(mapId);
    if (!manualMap) {
      issues.push({
        severity: "error",
        chapterId,
        mapId,
        path: `content/manual/world.content.json:maps[${mapId}]`,
        message: `chapter map "${mapId}" is missing from manual world content`,
      });
      return;
    }

    sourceEntry.map.npcs.forEach((npc, npcIndex) => {
      const manualNpcIndex = manualMap.npcs.findIndex((entry) => entry.id === npc.id);
      const manualNpc = manualNpcIndex >= 0 ? manualMap.npcs[manualNpcIndex] : undefined;
      const trigger = manualMap.triggers.find((entry) => entry.npcId === npc.id);
      rows.push({
        chapterId,
        mapId,
        npcId: npc.id,
        name: npc.name,
        x: npc.x,
        y: npc.y,
        facing: npc.facing,
        sprite: npc.sprite,
        behavior: npc.behavior,
        sourcePath: `${relative(sourceEntry.filePath)}:maps[${sourceEntry.mapIndex}].npcs[${npcIndex}]`,
        manualPath: manualNpc ? `content/manual/world.content.json:maps[${mapId}].npcs[${manualNpcIndex}]` : undefined,
        triggerId: trigger?.id,
        eventId: trigger?.eventId,
      });

      if (!manualNpc) {
        issues.push({
          severity: "error",
          chapterId,
          mapId,
          npcId: npc.id,
          path: `${relative(sourceEntry.filePath)}:maps[${sourceEntry.mapIndex}].npcs[${npcIndex}]`,
          message: `NPC "${npc.id}" exists in source but is missing from manual world map "${mapId}"`,
        });
        return;
      }

      if (manualNpc.x !== npc.x || manualNpc.y !== npc.y) {
        issues.push({
          severity: "warning",
          chapterId,
          mapId,
          npcId: npc.id,
          path: `content/manual/world.content.json:maps[${mapId}].npcs[${manualNpcIndex}]`,
          message: `NPC "${npc.id}" position differs from source (${npc.x}, ${npc.y}) -> manual (${manualNpc.x}, ${manualNpc.y})`,
        });
      }

      if (manualNpc.facing !== npc.facing) {
        issues.push({
          severity: "warning",
          chapterId,
          mapId,
          npcId: npc.id,
          path: `content/manual/world.content.json:maps[${mapId}].npcs[${manualNpcIndex}].facing`,
          message: `NPC "${npc.id}" facing differs from source "${npc.facing}" -> manual "${manualNpc.facing}"`,
        });
      }
    });
  });

  const manualNpcCount = world.maps
    .filter((map) => chapter.maps.includes(map.id))
    .reduce((sum, map) => sum + map.npcs.length, 0);

  return {
    generatedAt: new Date().toISOString(),
    chapterId,
    sourceMapFiles: [...sourceMapFiles].sort(),
    rows,
    issues,
    summary: {
      mapCount: chapter.maps.length,
      sourceNpcCount: rows.length,
      manualNpcCount,
      issueCount: issues.length,
    },
  };
}

export async function writeNpcPlacementImportArtifacts(report: NpcPlacementImportReport): Promise<string> {
  return writeReportArtifacts("npc-placement", report.chapterId, report);
}

export async function buildDialogueTableImportReport(
  sourceFilePath: string,
  chapterId?: string,
): Promise<DialogueTableImportReport> {
  const [source, story, chapters] = await Promise.all([
    loadTextSource(sourceFilePath),
    loadManualStoryContent(),
    loadRealChapterMetadata(),
  ]);

  const chapter = chapterId ? findChapter(chapters, chapterId) : undefined;
  const manualLineIndex = new Map(story.dialogueLines.map((line, index) => [line.id, { line, index }]));
  const manualEventIndex = new Map(story.events.map((event, index) => [event.id, { event, index }]));
  const rows: DialogueImportRow[] = [];
  const issues: HelperIssue[] = [];
  const sourceRelative = relative(sourceFilePath);

  source.dialogueLines.forEach((line, index) => {
    const manual = manualLineIndex.get(line.id);
    const chapterEvent = chapter ? chapter.events.some((eventId) => {
      const event = source.events.find((entry) => entry.id === eventId);
      if (!event) {
        return false;
      }
      return stableStringify(event.steps).includes(line.id);
    }) : false;
    let status: DialogueImportRow["status"] = "matched";

    if (!manual) {
      status = "missing-in-manual";
      issues.push({
        severity: "warning",
        path: `${sourceRelative}:dialogueLines[${index}]`,
        lineId: line.id,
        chapterId,
        message: `dialogue line "${line.id}" is not yet present in manual story content`,
      });
    } else if (
      manual.line.text !== line.text
      || manual.line.speakerName !== line.speakerName
      || manual.line.speakerNpcId !== line.speakerNpcId
    ) {
      status = "mismatch";
      issues.push({
        severity: "warning",
        path: `content/manual/story.content.json:dialogueLines[${manual.index}]`,
        lineId: line.id,
        chapterId,
        message: `dialogue line "${line.id}" differs between source text and manual story content`,
      });
    }

    rows.push({
      kind: "dialogue",
      id: line.id,
      sourcePath: `${sourceRelative}:dialogueLines[${index}]`,
      manualPath: manual ? `content/manual/story.content.json:dialogueLines[${manual.index}]` : undefined,
      chapterEvent,
      status,
    });
  });

  source.events.forEach((event, index) => {
    const manual = manualEventIndex.get(event.id);
    const chapterEvent = chapter ? chapter.events.includes(event.id) : false;
    let status: DialogueImportRow["status"] = "matched";

    if (!manual) {
      status = "missing-in-manual";
      issues.push({
        severity: "warning",
        path: `${sourceRelative}:events[${index}]`,
        eventId: event.id,
        chapterId,
        message: `event "${event.id}" is not yet present in manual story content`,
      });
    } else if (!compareUnknown(manual.event.steps, event.steps)) {
      status = "mismatch";
      issues.push({
        severity: "warning",
        path: `content/manual/story.content.json:events[${manual.index}]`,
        eventId: event.id,
        chapterId,
        message: `event "${event.id}" differs between source text and manual story content`,
      });
    }

    rows.push({
      kind: "event",
      id: event.id,
      sourcePath: `${sourceRelative}:events[${index}]`,
      manualPath: manual ? `content/manual/story.content.json:events[${manual.index}]` : undefined,
      chapterEvent,
      status,
    });
  });

  return {
    generatedAt: new Date().toISOString(),
    chapterId,
    sourceFile: sourceRelative,
    rows,
    issues,
    summary: {
      sourceDialogueCount: source.dialogueLines.length,
      sourceEventCount: source.events.length,
      matchedCount: rows.filter((row) => row.status === "matched").length,
      missingCount: rows.filter((row) => row.status === "missing-in-manual").length,
      mismatchCount: rows.filter((row) => row.status === "mismatch").length,
    },
  };
}

export async function writeDialogueTableImportArtifacts(report: DialogueTableImportReport): Promise<string> {
  const targetName = report.chapterId ?? fileStem(report.sourceFile);
  return writeReportArtifacts("dialogue-import", targetName, report);
}

export async function buildEventTextLinkageReport(options?: {
  chapterId?: string;
  sourceFilePath?: string;
}): Promise<EventTextLinkageReport> {
  const sourceFilePath = options?.sourceFilePath;
  const chapterId = options?.chapterId;
  const [story, chapters, source] = await Promise.all([
    loadManualStoryContent(),
    loadRealChapterMetadata(),
    sourceFilePath ? loadTextSource(sourceFilePath) : Promise.resolve(undefined),
  ]);

  const issues: HelperIssue[] = [];
  const chapter = chapterId ? findChapter(chapters, chapterId) : undefined;
  const eventIds = chapter ? chapter.events : (source?.events.map((event) => event.id) ?? story.events.map((event) => event.id));
  const events = source
    ? source.events.filter((event) => eventIds.includes(event.id))
    : story.events.filter((event) => eventIds.includes(event.id));
  const knownLineIds = new Set((source?.dialogueLines ?? story.dialogueLines).map((line) => line.id));
  const baseLabel = sourceFilePath ? relative(sourceFilePath) : "content/manual/story.content.json";

  events.forEach((event, eventIndex) => {
    collectDialogueLineIds(
      event.steps as unknown as Array<Record<string, unknown>>,
      event.id,
      issues,
      `${baseLabel}:events[${eventIndex}].steps`,
      knownLineIds,
      new Set<string>(),
      chapterId,
    );
  });

  return {
    generatedAt: new Date().toISOString(),
    chapterId,
    sourceFile: sourceFilePath ? relative(sourceFilePath) : undefined,
    checkedEventCount: events.length,
    issues,
  };
}

export async function writeEventTextLinkageArtifacts(report: EventTextLinkageReport): Promise<string> {
  const targetName = report.chapterId ?? "manual-story";
  return writeReportArtifacts("event-text-linkage", targetName, report);
}

export async function buildSpeakerMetadataReport(options?: {
  chapterId?: string;
  sourceFilePath?: string;
}): Promise<SpeakerMetadataReport> {
  const sourceFilePath = options?.sourceFilePath;
  const chapterId = options?.chapterId;
  const [world, chapters, source, story] = await Promise.all([
    loadManualWorldContent(),
    loadRealChapterMetadata(),
    sourceFilePath ? loadTextSource(sourceFilePath) : Promise.resolve(undefined),
    loadManualStoryContent(),
  ]);

  const chapter = chapterId ? findChapter(chapters, chapterId) : undefined;
  const chapterNpcIds = chapter ? buildChapterNpcSet(world, chapter) : undefined;
  const lines = source?.dialogueLines ?? story.dialogueLines;
  const baseLabel = sourceFilePath ? relative(sourceFilePath) : "content/manual/story.content.json";
  const issues: HelperIssue[] = [];

  lines.forEach((line, index) => {
    const linePath = `${baseLabel}:dialogueLines[${index}]`;
    if (typeof line.speakerName !== "string" || line.speakerName.trim().length === 0) {
      issues.push({
        severity: "warning",
        path: `${linePath}.speakerName`,
        lineId: line.id,
        chapterId,
        message: `dialogue line "${line.id}" is missing speakerName metadata`,
      });
    }

    if (typeof line.portraitId !== "string" || line.portraitId.trim().length === 0) {
      issues.push({
        severity: "warning",
        path: `${linePath}.portraitId`,
        lineId: line.id,
        chapterId,
        message: `dialogue line "${line.id}" is missing portraitId metadata`,
      });
    }

    if (typeof line.styleId !== "string" || line.styleId.trim().length === 0) {
      issues.push({
        severity: "warning",
        path: `${linePath}.styleId`,
        lineId: line.id,
        chapterId,
        message: `dialogue line "${line.id}" is missing styleId metadata`,
      });
    }

    if (chapterNpcIds && typeof line.speakerNpcId === "string" && !chapterNpcIds.has(line.speakerNpcId)) {
      issues.push({
        severity: "warning",
        path: `${linePath}.speakerNpcId`,
        lineId: line.id,
        chapterId,
        message: `dialogue line "${line.id}" references speakerNpcId "${line.speakerNpcId}" outside chapter "${chapterId}"`,
      });
    }
  });

  return {
    generatedAt: new Date().toISOString(),
    chapterId,
    sourceFile: sourceFilePath ? relative(sourceFilePath) : undefined,
    checkedLineCount: lines.length,
    issues,
  };
}

export async function writeSpeakerMetadataArtifacts(report: SpeakerMetadataReport): Promise<string> {
  const targetName = report.chapterId ?? "manual-story";
  return writeReportArtifacts("speaker-metadata", targetName, report);
}

export async function buildChapterNpcTextCompletenessReport(): Promise<ChapterNpcTextCompletenessReport> {
  const [chapters, world, story, sourceMapIndex] = await Promise.all([
    loadRealChapterMetadata(),
    loadManualWorldContent(),
    loadManualStoryContent(),
    loadSourceMapIndex(),
  ]);

  const importedChapters = chapters.filter((chapter) => chapter.chapterId !== "chapter-template");
  const storyEventIndex = new Map(story.events.map((event) => [event.id, event]));
  const storyLineIds = new Set(story.dialogueLines.map((line) => line.id));
  const issues: HelperIssue[] = [];
  const chapterReports = await Promise.all(importedChapters.map(async (chapter) => {
    const sourceTextFilePath = sourceTextPathForChapter(chapter.chapterId);
    let sourceText: TextSourceDocument | undefined;
    try {
      sourceText = await loadTextSource(sourceTextFilePath);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("ENOENT")) {
        sourceText = undefined;
      } else {
        throw error;
      }
    }

    const npcReport = await buildNpcPlacementImportReport(chapter.chapterId);
    const linkageReport = await buildEventTextLinkageReport({
      chapterId: chapter.chapterId,
      sourceFilePath: sourceText ? sourceTextFilePath : undefined,
    });
    const speakerReport = sourceText
      ? await buildSpeakerMetadataReport({
        chapterId: chapter.chapterId,
        sourceFilePath: sourceTextFilePath,
      })
      : {
        generatedAt: new Date().toISOString(),
        chapterId: chapter.chapterId,
        checkedLineCount: 0,
        issues: [{
          severity: "warning" as const,
          chapterId: chapter.chapterId,
          path: `content/source/text/${chapter.chapterId}.source.json`,
          message: `chapter "${chapter.chapterId}" does not have a source text table yet`,
        }],
      };

    issues.push(...npcReport.issues, ...linkageReport.issues, ...speakerReport.issues);

    const referencedLineIds = new Set<string>();
    chapter.events.forEach((eventId) => {
      const event = storyEventIndex.get(eventId);
      if (!event) {
        return;
      }
      collectDialogueLineIds(
        event.steps as unknown as Array<Record<string, unknown>>,
        eventId,
        [],
        `content/manual/story.content.json:event(${eventId}).steps`,
        storyLineIds,
        referencedLineIds,
        chapter.chapterId,
      );
    });

    const sourceMapCount = chapter.maps.filter((mapId) => sourceMapIndex.has(mapId)).length;
    const sourceNpcCount = chapter.maps.reduce((sum, mapId) => {
      const sourceEntry = sourceMapIndex.get(mapId);
      return sum + (sourceEntry?.map.npcs.length ?? 0);
    }, 0);
    const manualNpcCount = world.maps
      .filter((map) => chapter.maps.includes(map.id))
      .reduce((sum, map) => sum + map.npcs.length, 0);

    const sourceMissing = sourceMapCount !== chapter.maps.length || !sourceText;
    const issueCount = npcReport.issues.length + linkageReport.issues.length + speakerReport.issues.length;

    return {
      chapterId: chapter.chapterId,
      title: chapter.title,
      sourceMapCount,
      sourceNpcCount,
      manualNpcCount,
      chapterNpcCount: chapter.npcs.length,
      sourceTextFile: sourceText ? relative(sourceTextFilePath) : undefined,
      sourceDialogueCount: sourceText?.dialogueLines.length ?? 0,
      sourceEventCount: sourceText?.events.length ?? 0,
      referencedDialogueCount: referencedLineIds.size,
      npcIssueCount: npcReport.issues.length,
      linkageIssueCount: linkageReport.issues.length,
      speakerIssueCount: speakerReport.issues.length,
      status: sourceMissing ? "missing-source" : issueCount > 0 ? "partial" : "ready",
    } satisfies ChapterNpcTextCoverage;
  }));

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      chapterCount: chapterReports.length,
      readyCount: chapterReports.filter((entry) => entry.status === "ready").length,
      partialCount: chapterReports.filter((entry) => entry.status === "partial").length,
      missingSourceCount: chapterReports.filter((entry) => entry.status === "missing-source").length,
      issueCount: issues.length,
    },
    chapters: chapterReports,
    issues,
  };
}

export async function writeChapterNpcTextCompletenessArtifacts(
  report: ChapterNpcTextCompletenessReport,
): Promise<string> {
  return writeReportArtifacts("chapter-npc-text", "completeness", report);
}

export function parseChapterArg(argv: string[]): string | undefined {
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--chapter") {
      return argv[index + 1];
    }
  }
  return undefined;
}

export function parseInputArg(argv: string[]): string | undefined {
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--input") {
      return argv[index + 1];
    }
  }
  return undefined;
}

export function resolveChapterSourceTextFile(chapterId?: string, explicitInput?: string): string {
  if (explicitInput) {
    if (explicitInput.startsWith("/")) {
      return explicitInput;
    }
    return path.join(repoRoot, explicitInput);
  }
  if (!chapterId) {
    throw formatError("tools", "input", "provide --chapter or --input");
  }
  return sourceTextPathForChapter(chapterId);
}
