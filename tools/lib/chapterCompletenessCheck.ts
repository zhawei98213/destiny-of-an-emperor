import type { ChapterMetadata } from "./chapterMetadata";
import {
  loadManualStoryContent,
  loadManualWorldContent,
  loadRealChapterMetadata,
} from "./manualContent";

export interface ChapterCompletenessIssue {
  chapterId: string;
  severity: "error" | "warning";
  path: string;
  message: string;
}

export interface ChapterCompletenessChapterReport {
  chapterId: string;
  issues: ChapterCompletenessIssue[];
}

export interface ChapterCompletenessReport {
  checkedChapters: number;
  issues: ChapterCompletenessIssue[];
  chapters: ChapterCompletenessChapterReport[];
}

function compareListedIds(
  chapter: ChapterMetadata,
  label: string,
  listed: string[],
  actual: string[],
  sharedOwners: Map<string, string[]> = new Map(),
): ChapterCompletenessIssue[] {
  const issues: ChapterCompletenessIssue[] = [];
  const listedSet = new Set(listed);
  const actualSet = new Set(actual);

  actual
    .filter((id) => !listedSet.has(id))
    .sort((left, right) => left.localeCompare(right))
    .forEach((id) => {
      const owners = sharedOwners.get(id) ?? [];
      issues.push({
        chapterId: chapter.chapterId,
        severity: owners.length > 0 ? "warning" : "error",
        path: `${chapter.chapterId}.${label}`,
        message: owners.length > 0
          ? `reachable ${label} id "${id}" is already tracked by chapter metadata ${owners.join(", ")}`
          : `missing ${label} id "${id}" from chapter metadata`,
      });
    });

  listed
    .filter((id) => !actualSet.has(id))
    .sort((left, right) => left.localeCompare(right))
    .forEach((id) => {
      issues.push({
        chapterId: chapter.chapterId,
        severity: "warning",
        path: `${chapter.chapterId}.${label}`,
        message: `listed ${label} id "${id}" is not currently reachable from chapter maps`,
      });
    });

  return issues;
}

export async function runChapterCompletenessCheck(): Promise<ChapterCompletenessReport> {
  const [world, story, chapters] = await Promise.all([
    loadManualWorldContent(),
    loadManualStoryContent(),
    loadRealChapterMetadata(),
  ]);

  const storyEventIds = new Set(story.events.map((entry) => entry.id));
  const worldMapIndex = new Map(world.maps.map((entry) => [entry.id, entry]));
  const encounterTableIndex = new Map(world.encounterTables.map((entry) => [entry.id, entry]));
  const chapterEventOwners = new Map<string, string[]>();
  chapters.forEach((chapter) => {
    chapter.events.forEach((eventId) => {
      chapterEventOwners.set(eventId, [...(chapterEventOwners.get(eventId) ?? []), chapter.chapterId]);
    });
  });
  const chapterReports: ChapterCompletenessChapterReport[] = [];
  const allIssues: ChapterCompletenessIssue[] = [];

  chapters.forEach((chapter) => {
    const issues: ChapterCompletenessIssue[] = [];
    const maps = chapter.maps
      .map((mapId) => worldMapIndex.get(mapId))
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

    chapter.maps.forEach((mapId) => {
      if (!worldMapIndex.has(mapId)) {
        issues.push({
          chapterId: chapter.chapterId,
          severity: "error",
          path: `${chapter.chapterId}.maps`,
          message: `chapter references unknown map "${mapId}"`,
        });
      }
    });

    const actualNpcIds = maps.flatMap((map) => map.npcs.map((npc) => npc.id));
    const actualEventIds = maps.flatMap((map) =>
      map.triggers
        .map((trigger) => trigger.eventId)
        .filter((eventId): eventId is string => Boolean(eventId)),
    );
    const actualShopIds = maps.flatMap((map) =>
      map.npcs
        .map((npc) => npc.shopId)
        .filter((shopId): shopId is string => Boolean(shopId)),
    );
    const actualEnemyGroupIds = maps.flatMap((map) =>
      map.triggers
        .map((trigger) => trigger.encounterTableId)
        .filter((encounterTableId): encounterTableId is string => Boolean(encounterTableId))
        .flatMap((encounterTableId) => encounterTableIndex.get(encounterTableId)?.entries.map((entry) => entry.battleGroupId) ?? []),
    );

    issues.push(...compareListedIds(chapter, "npcs", chapter.npcs, actualNpcIds));
    issues.push(...compareListedIds(chapter, "events", chapter.events, actualEventIds, chapterEventOwners));
    issues.push(...compareListedIds(chapter, "shops", chapter.shops, actualShopIds));
    issues.push(...compareListedIds(chapter, "enemyGroups", chapter.enemyGroups, actualEnemyGroupIds));

    chapter.events.forEach((eventId) => {
      if (!storyEventIds.has(eventId)) {
        issues.push({
          chapterId: chapter.chapterId,
          severity: "error",
          path: `${chapter.chapterId}.events`,
          message: `chapter metadata lists missing story event "${eventId}"`,
        });
      }
    });

    chapterReports.push({
      chapterId: chapter.chapterId,
      issues,
    });
    allIssues.push(...issues);
  });

  return {
    checkedChapters: chapters.length,
    issues: allIssues,
    chapters: chapterReports,
  };
}
