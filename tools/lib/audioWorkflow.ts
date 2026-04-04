import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadRealChapterMetadata, loadManualAssetRegistryContent, loadManualWorldContent } from "./manualContent";
import { readJsonFile, repoRoot, stableStringify } from "./importerCore";

interface AudioRoutingDocument {
  format: "audio-routing-v1";
  defaults: {
    worldBgmKey: string;
    battleBgmKey: string;
    sfxFallbackKey: string;
  };
  chapters: Array<{
    chapterId: string;
    mapAudio: Array<{
      mapId: string;
      bgmKey: string;
    }>;
    battleAudio: Array<{
      battleGroupId: string;
      bgmKey: string;
    }>;
    sfxKeys: string[];
    notes: string;
  }>;
}

export interface AudioWorkflowIssue {
  severity: "blocker" | "non-blocker";
  chapterId: string;
  path: string;
  message: string;
}

export interface AudioWorkflowReport {
  generatedAt: string;
  chapterMappings: Array<{
    chapterId: string;
    mappedMaps: string[];
    mappedBattleGroups: string[];
    sfxKeys: string[];
    placeholderKeys: string[];
    importedKeys: string[];
  }>;
  missingAudioFallbackRules: string[];
  issues: AudioWorkflowIssue[];
}

export const audioWorkflowReportDir = path.join(repoRoot, "reports", "audio-workflow", "latest");
const audioRoutingPath = path.join(repoRoot, "content", "manual", "audio-routing.content.json");

export async function buildAudioWorkflowReport(): Promise<AudioWorkflowReport> {
  const audioRouting = await readJsonFile<AudioRoutingDocument>(audioRoutingPath);
  const chapters = await loadRealChapterMetadata();
  const world = await loadManualWorldContent();
  const assetRegistry = await loadManualAssetRegistryContent();

  const chapterIndex = new Map(chapters.map((entry) => [entry.chapterId, entry]));
  const mapIds = new Set(world.maps.map((entry) => entry.id));
  const battleGroupIds = new Set(world.encounterTables.flatMap((entry) => entry.entries.map((child) => child.battleGroupId)));
  const assetBindingEntries: Array<[string, { state: string }]> = [
    ...assetRegistry.assetBindings.map((entry) => [entry.key, { state: entry.state }] as [string, { state: string }]),
    ...assetRegistry.assetOverrides.flatMap((override) =>
      override.assetBindings.map((entry) => [entry.key, { state: entry.state }] as [string, { state: string }]),
    ),
  ];
  const assetBindings = new Map<string, { state: string }>(assetBindingEntries);

  const issues: AudioWorkflowIssue[] = [];
  const chapterMappings = audioRouting.chapters.map((entry) => {
    if (!chapterIndex.has(entry.chapterId)) {
      issues.push({
        severity: "blocker",
        chapterId: entry.chapterId,
        path: "chapters",
        message: `audio routing references missing chapter "${entry.chapterId}"`,
      });
    }

    entry.mapAudio.forEach((mapAudio, index) => {
      if (!mapIds.has(mapAudio.mapId)) {
        issues.push({
          severity: "blocker",
          chapterId: entry.chapterId,
          path: `chapters[${index}].mapAudio`,
          message: `audio routing references missing map "${mapAudio.mapId}"`,
        });
      }
      if (!assetBindings.has(mapAudio.bgmKey)) {
        issues.push({
          severity: "blocker",
          chapterId: entry.chapterId,
          path: `chapters[${index}].mapAudio`,
          message: `audio routing references missing asset key "${mapAudio.bgmKey}"`,
        });
      }
    });

    entry.battleAudio.forEach((battleAudio, index) => {
      if (!battleGroupIds.has(battleAudio.battleGroupId)) {
        issues.push({
          severity: "blocker",
          chapterId: entry.chapterId,
          path: `chapters[${index}].battleAudio`,
          message: `audio routing references missing battle group "${battleAudio.battleGroupId}"`,
        });
      }
      if (!assetBindings.has(battleAudio.bgmKey)) {
        issues.push({
          severity: "blocker",
          chapterId: entry.chapterId,
          path: `chapters[${index}].battleAudio`,
          message: `audio routing references missing asset key "${battleAudio.bgmKey}"`,
        });
      }
    });

    entry.sfxKeys.forEach((sfxKey, index) => {
      if (!assetBindings.has(sfxKey)) {
        issues.push({
          severity: "blocker",
          chapterId: entry.chapterId,
          path: `chapters[${index}].sfxKeys`,
          message: `audio routing references missing SFX key "${sfxKey}"`,
        });
      }
    });

    const allKeys = [
      ...entry.mapAudio.map((mapAudio) => mapAudio.bgmKey),
      ...entry.battleAudio.map((battleAudio) => battleAudio.bgmKey),
      ...entry.sfxKeys,
    ];
    return {
      chapterId: entry.chapterId,
      mappedMaps: entry.mapAudio.map((mapAudio) => mapAudio.mapId),
      mappedBattleGroups: entry.battleAudio.map((battleAudio) => battleAudio.battleGroupId),
      sfxKeys: [...entry.sfxKeys],
      placeholderKeys: allKeys.filter((key) => assetBindings.get(key)?.state === "placeholder"),
      importedKeys: allKeys.filter((key) => assetBindings.get(key)?.state === "imported" || assetBindings.get(key)?.state === "locked"),
    };
  });

  const missingAudioFallbackRules = [
    audioRouting.defaults.worldBgmKey,
    audioRouting.defaults.battleBgmKey,
    audioRouting.defaults.sfxFallbackKey,
  ].filter((key) => !assetBindings.has(key));

  missingAudioFallbackRules.forEach((key) => {
    issues.push({
      severity: "blocker",
      chapterId: "global",
      path: "defaults",
      message: `audio fallback key "${key}" is missing from the asset registry`,
    });
  });

  return {
    generatedAt: new Date().toISOString(),
    chapterMappings,
    missingAudioFallbackRules,
    issues,
  };
}

function renderSummary(report: AudioWorkflowReport): string {
  return [
    "# Audio Workflow Report",
    "# 音频工作流报告",
    "",
    `- Generated At / 生成时间: ${report.generatedAt}`,
    `- Chapter Count / 章节数量: ${report.chapterMappings.length}`,
    `- Issue Count / 问题数: ${report.issues.length}`,
    "",
    ...report.chapterMappings.flatMap((entry) => [
      `## ${entry.chapterId}`,
      "",
      `- Mapped Maps / 已映射地图: ${entry.mappedMaps.join(", ") || "none / 无"}`,
      `- Mapped Battle Groups / 已映射战斗组: ${entry.mappedBattleGroups.join(", ") || "none / 无"}`,
      `- Imported Or Locked Keys / 已导入或锁定 key: ${entry.importedKeys.join(", ") || "none / 无"}`,
      `- Placeholder Keys / 占位 key: ${entry.placeholderKeys.join(", ") || "none / 无"}`,
      "",
    ]),
  ].join("\n");
}

export async function writeAudioWorkflowArtifacts(): Promise<AudioWorkflowReport> {
  const report = await buildAudioWorkflowReport();
  await mkdir(audioWorkflowReportDir, { recursive: true });
  await writeFile(path.join(audioWorkflowReportDir, "report.json"), `${stableStringify(report)}\n`, "utf8");
  await writeFile(path.join(audioWorkflowReportDir, "summary.md"), `${renderSummary(report)}\n`, "utf8");
  return report;
}
