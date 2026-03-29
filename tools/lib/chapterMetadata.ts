import path from "node:path";
import { readdir } from "node:fs/promises";
import { formatError, readJsonFile, repoRoot } from "./importerCore";

export type ChapterStatus =
  | "planned"
  | "importing"
  | "validating"
  | "parity-review"
  | "locked";

export interface ChapterParitySummary {
  mapLayout: ChapterStatus;
  collision: ChapterStatus;
  npcPlacement: ChapterStatus;
  dialogue: ChapterStatus;
  events: ChapterStatus;
  flags: ChapterStatus;
  transitions: ChapterStatus;
  items: ChapterStatus;
  shops: ChapterStatus;
  battles: ChapterStatus;
}

export interface ChapterMetadata {
  format: "chapter-metadata-v1";
  chapterId: string;
  title: string;
  areaLabel: string;
  status: ChapterStatus;
  maps: string[];
  npcs: string[];
  events: string[];
  shops: string[];
  enemyGroups: string[];
  regressionCases: string[];
  paritySummary: ChapterParitySummary;
  notes: string;
}

const VALID_STATUSES: readonly ChapterStatus[] = [
  "planned",
  "importing",
  "validating",
  "parity-review",
  "locked",
] as const;

function expectRecord(value: unknown, filePath: string, fieldPath: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw formatError(filePath, fieldPath, "must be an object");
  }

  return value as Record<string, unknown>;
}

function expectString(value: unknown, filePath: string, fieldPath: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw formatError(filePath, fieldPath, "must be a non-empty string");
  }

  return value;
}

function expectStringArray(value: unknown, filePath: string, fieldPath: string): string[] {
  if (!Array.isArray(value)) {
    throw formatError(filePath, fieldPath, "must be an array");
  }

  return value.map((entry, index) => expectString(entry, filePath, `${fieldPath}[${index}]`));
}

function expectStatus(value: unknown, filePath: string, fieldPath: string): ChapterStatus {
  if (!VALID_STATUSES.includes(value as ChapterStatus)) {
    throw formatError(
      filePath,
      fieldPath,
      `must be one of ${VALID_STATUSES.join(", ")}`,
    );
  }

  return value as ChapterStatus;
}

function validateParitySummary(
  value: unknown,
  filePath: string,
  fieldPath: string,
): ChapterParitySummary {
  const record = expectRecord(value, filePath, fieldPath);
  return {
    mapLayout: expectStatus(record.mapLayout, filePath, `${fieldPath}.mapLayout`),
    collision: expectStatus(record.collision, filePath, `${fieldPath}.collision`),
    npcPlacement: expectStatus(record.npcPlacement, filePath, `${fieldPath}.npcPlacement`),
    dialogue: expectStatus(record.dialogue, filePath, `${fieldPath}.dialogue`),
    events: expectStatus(record.events, filePath, `${fieldPath}.events`),
    flags: expectStatus(record.flags, filePath, `${fieldPath}.flags`),
    transitions: expectStatus(record.transitions, filePath, `${fieldPath}.transitions`),
    items: expectStatus(record.items, filePath, `${fieldPath}.items`),
    shops: expectStatus(record.shops, filePath, `${fieldPath}.shops`),
    battles: expectStatus(record.battles, filePath, `${fieldPath}.battles`),
  };
}

export function validateChapterMetadata(
  value: unknown,
  filePath: string,
): ChapterMetadata {
  const record = expectRecord(value, filePath, "root");
  if (record.format !== "chapter-metadata-v1") {
    throw formatError(filePath, "format", 'must be "chapter-metadata-v1"');
  }

  return {
    format: "chapter-metadata-v1",
    chapterId: expectString(record.chapterId, filePath, "chapterId"),
    title: expectString(record.title, filePath, "title"),
    areaLabel: expectString(record.areaLabel, filePath, "areaLabel"),
    status: expectStatus(record.status, filePath, "status"),
    maps: expectStringArray(record.maps, filePath, "maps"),
    npcs: expectStringArray(record.npcs, filePath, "npcs"),
    events: expectStringArray(record.events, filePath, "events"),
    shops: expectStringArray(record.shops, filePath, "shops"),
    enemyGroups: expectStringArray(record.enemyGroups, filePath, "enemyGroups"),
    regressionCases: expectStringArray(record.regressionCases, filePath, "regressionCases"),
    paritySummary: validateParitySummary(record.paritySummary, filePath, "paritySummary"),
    notes: expectString(record.notes, filePath, "notes"),
  };
}

export async function loadChapterMetadata(filePath: string): Promise<ChapterMetadata> {
  const document = await readJsonFile<unknown>(filePath);
  const relativePath = path.relative(repoRoot, filePath);
  return validateChapterMetadata(document, relativePath);
}

export async function loadAllChapterMetadata(chapterDir: string): Promise<ChapterMetadata[]> {
  const entries = await readdir(chapterDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  return Promise.all(files.map((fileName) => loadChapterMetadata(path.join(chapterDir, fileName))));
}
