import path from "node:path";
import { readFile } from "node:fs/promises";
import {
  loadManualAssetRegistryContent,
  loadManualStoryContent,
  loadManualWorldContent,
  loadRealChapterMetadata,
} from "./manualContent";
import { readJsonFile, repoRoot, stableStringify } from "./importerCore";

export type AssetParityStatus =
  | "placeholder"
  | "imported"
  | "locked";

export type AssetCategoryId =
  | "tilesets"
  | "character-sprites"
  | "npc-sprites"
  | "enemy-sprites"
  | "ui-panels"
  | "icons"
  | "audio";

export interface AssetIssue {
  type:
    | "missing-resource"
    | "unreferenced-resource"
    | "broken-reference"
    | "sprite-metadata";
  severity: "warning" | "error";
  categoryId: AssetCategoryId;
  path: string;
  message: string;
}

export interface AssetCategoryReport {
  id: AssetCategoryId;
  label: string;
  status: AssetParityStatus;
  referencedIds: string[];
  availableIds: string[];
  missingIds: string[];
  unreferencedIds: string[];
  notes: string[];
}

export interface ChapterAssetReport {
  chapterId: string;
  title: string;
  categories: AssetCategoryReport[];
}

export interface AssetParityReport {
  generatedAt: string;
  summary: {
    chapterCount: number;
    issueCount: number;
    placeholderCategories: number;
  };
  issues: AssetIssue[];
  chapters: ChapterAssetReport[];
}

interface SpriteMetadataFrame {
  id: string;
  frame: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

interface SpriteMetadataDocument {
  sheetId: string;
  imagePath: string;
  tileWidth: number;
  tileHeight: number;
  frames: SpriteMetadataFrame[];
}

interface SpriteSourceDocument {
  sheetId: string;
  imagePath: string;
  tileWidth: number;
  tileHeight: number;
  frames: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

interface GeneratedBattleContent {
  enemies: Array<{
    id: string;
  }>;
  battleGroups: Array<{
    id: string;
    enemyIds: string[];
  }>;
}

const SPRITE_METADATA_PATH = path.join(repoRoot, "content", "generated", "sprite-metadata.generated.json");
const SPRITE_SOURCE_PATH = path.join(repoRoot, "content", "source", "sprites", "demo-sheet.source.json");
const GENERATED_BATTLE_PATH = path.join(repoRoot, "content", "generated", "battle.content.json");

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function sortStrings(values: string[]): string[] {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function familyFromFrameId(frameId: string): string {
  const dashIndex = frameId.indexOf("-");
  return dashIndex === -1 ? frameId : frameId.slice(0, dashIndex);
}

async function fileExists(targetPath: string): Promise<boolean> {
  try {
    await readFile(path.join(repoRoot, targetPath.startsWith("/") ? targetPath.slice(1) : targetPath), "utf8");
    return true;
  } catch {
    return false;
  }
}

async function scanSceneAssetLiterals(): Promise<AssetIssue[]> {
  const scenePaths = [
    path.join(repoRoot, "game", "src", "scenes", "BootScene.ts"),
    path.join(repoRoot, "game", "src", "scenes", "TitleScene.ts"),
    path.join(repoRoot, "game", "src", "scenes", "WorldScene.ts"),
    path.join(repoRoot, "game", "src", "scenes", "BattleScene.ts"),
  ];
  const issues: AssetIssue[] = [];

  for (const scenePath of scenePaths) {
    const text = await readFile(scenePath, "utf8");
    const lines = text.split("\n");
    lines.forEach((line, index) => {
      if (line.includes("/assets/") || line.includes(".png") || line.includes(".ogg") || line.includes(".mp3") || line.includes(".wav")) {
        issues.push({
          type: "broken-reference",
          severity: "warning",
          categoryId: "ui-panels",
          path: path.relative(repoRoot, scenePath),
          message: `line ${index + 1} contains a literal asset path; move it into content or a resource registry`,
        });
      }
    });
  }

  return issues;
}

function collectEventLineIds(steps: Array<Record<string, unknown>>, lineIds: Set<string>): void {
  steps.forEach((step) => {
    if (step.type === "dialogue" && typeof step.lineId === "string") {
      lineIds.add(step.lineId);
    }

    if (Array.isArray(step.steps)) {
      collectEventLineIds(step.steps as Array<Record<string, unknown>>, lineIds);
    }
  });
}

function statusFromCategory(category: AssetCategoryReport): AssetParityStatus {
  if (category.missingIds.length > 0 || category.notes.some((note) => note.includes("placeholder"))) {
    return "placeholder";
  }

  if (category.referencedIds.length === 0 && category.availableIds.length === 0) {
    return "placeholder";
  }

  if (category.notes.some((note) => note.includes("state:locked"))) {
    return "locked";
  }

  return "imported";
}

function buildCategory(
  id: AssetCategoryId,
  label: string,
  referencedIds: string[],
  availableIds: string[],
  notes: string[] = [],
): AssetCategoryReport {
  const referenced = sortStrings(unique(referencedIds));
  const available = sortStrings(unique(availableIds));
  const availableSet = new Set(available);
  const referencedSet = new Set(referenced);

  const missingIds = referenced.filter((entry) => !availableSet.has(entry));
  const unreferencedIds = available.filter((entry) => !referencedSet.has(entry));

  const category: AssetCategoryReport = {
    id,
    label,
    status: "placeholder",
    referencedIds: referenced,
    availableIds: available,
    missingIds,
    unreferencedIds,
    notes,
  };
  category.status = statusFromCategory(category);
  return category;
}

export async function buildAssetParityReport(): Promise<AssetParityReport> {
  const [chapters, world, story, assetRegistry, spriteMetadata, spriteSource, battleContent] = await Promise.all([
    loadRealChapterMetadata(),
    loadManualWorldContent(),
    loadManualStoryContent(),
    loadManualAssetRegistryContent(),
    readJsonFile<SpriteMetadataDocument>(SPRITE_METADATA_PATH),
    readJsonFile<SpriteSourceDocument>(SPRITE_SOURCE_PATH),
    readJsonFile<GeneratedBattleContent>(GENERATED_BATTLE_PATH),
  ]);

  const issues: AssetIssue[] = await scanSceneAssetLiterals();
  const spriteImageExists = await fileExists(spriteMetadata.imagePath);
  const sourceFrameIds = sortStrings(spriteSource.frames.map((frame) => frame.id));
  const metadataFrameIds = sortStrings(spriteMetadata.frames.map((frame) => frame.id));
  const metadataFamilies = unique(spriteMetadata.frames.map((frame) => familyFromFrameId(frame.id)));
  const baseAssetMap = new Map(assetRegistry.assetBindings.map((entry) => [entry.key, entry]));

  if (!spriteImageExists) {
    issues.push({
      type: "missing-resource",
      severity: "error",
      categoryId: "npc-sprites",
      path: "content/generated/sprite-metadata.generated.json:imagePath",
      message: `sprite sheet image path "${spriteMetadata.imagePath}" does not exist in the repository`,
    });
  }

  if (stableStringify(sourceFrameIds) !== stableStringify(metadataFrameIds)) {
    issues.push({
      type: "sprite-metadata",
      severity: "error",
      categoryId: "npc-sprites",
      path: "content/generated/sprite-metadata.generated.json:frames",
      message: "generated sprite metadata frame ids do not match sprite source frame ids",
    });
  }

  const mapIndex = new Map(world.maps.map((entry) => [entry.id, entry]));
  const eventIndex = new Map(story.events.map((entry) => [entry.id, entry]));
  const lineIndex = new Map(story.dialogueLines.map((entry) => [entry.id, entry]));
  const battleGroupIndex = new Map(battleContent.battleGroups.map((entry) => [entry.id, entry]));
  const itemIds = unique(world.items.map((entry) => entry.id));

  const chaptersReport: ChapterAssetReport[] = chapters.map((chapter) => {
    const maps = chapter.maps
      .map((mapId) => mapIndex.get(mapId))
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
    const lineIds = new Set<string>();
    chapter.events.forEach((eventId) => {
      const event = eventIndex.get(eventId);
      if (event) {
        collectEventLineIds(event.steps as Array<Record<string, unknown>>, lineIds);
      }
    });
    const lines = [...lineIds]
      .map((lineId) => lineIndex.get(lineId))
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

    const npcSprites = maps.flatMap((map) =>
      map.npcs
        .map((npc) => npc.sprite)
        .filter((entry): entry is string => Boolean(entry)),
    );
    const portraitIds = lines
      .map((line) => line.portraitId)
      .filter((entry): entry is string => Boolean(entry));
    const soundIds = unique([
      ...lines.map((line) => line.soundId).filter((entry): entry is string => Boolean(entry)),
      ...chapter.events.flatMap((eventId) => {
        const event = eventIndex.get(eventId);
        if (!event) {
          return [];
        }
        const ids: string[] = [];
        const visit = (steps: Array<Record<string, unknown>>): void => {
          steps.forEach((step) => {
            if (step.type === "playSfx" && typeof step.sfxId === "string") {
              ids.push(step.sfxId);
            }
            if (Array.isArray(step.steps)) {
              visit(step.steps as Array<Record<string, unknown>>);
            }
          });
        };
        visit(event.steps as Array<Record<string, unknown>>);
        return ids;
      }),
    ]);

    const chapterOverrideMap = new Map(
      assetRegistry.assetOverrides
        .filter((override) => chapter.maps.some((mapId) => override.mapIds.includes(mapId)))
        .flatMap((override) => override.assetBindings)
        .map((binding) => [binding.key, binding]),
    );

    const collectStateNotes = (keys: string[]): string[] => {
      const states = unique(keys.map((key) => chapterOverrideMap.get(key)?.state ?? baseAssetMap.get(key)?.state ?? "placeholder"));
      return states.map((state) => `state:${state}`);
    };

    const categories: AssetCategoryReport[] = [
      buildCategory(
        "tilesets",
        "Tilesets / 地图图块集",
        maps.map((map) => `tileset.${map.id}`),
        unique([...baseAssetMap.keys(), ...chapterOverrideMap.keys()]).filter((key) => key.startsWith("tileset.")),
        [
          ...collectStateNotes(maps.map((map) => `tileset.${map.id}`)),
          ...maps
            .map((map) => {
              const binding = chapterOverrideMap.get(`tileset.${map.id}`) ?? baseAssetMap.get(`tileset.${map.id}`) ?? baseAssetMap.get("tileset.default");
              if (!binding || binding.resource.kind !== "tileset-palette") {
                return `tileset ${map.id} is still missing a palette binding / 地图 ${map.id} 仍缺少 tileset palette 绑定`;
              }

              const candidateIds = Array.isArray(binding.resource.sourceCandidateIds)
                ? binding.resource.sourceCandidateIds.filter((entry): entry is string => typeof entry === "string")
                : [];
              return candidateIds.length > 0
                ? `tileset ${map.id} uses candidates ${candidateIds.join(", ")} / 地图 ${map.id} 使用候选集 ${candidateIds.join(", ")}`
                : `tileset ${map.id} still resolves to fallback palette / 地图 ${map.id} 目前仍回退到默认 palette`;
            }),
        ],
      ),
      buildCategory(
        "character-sprites",
        "Character Sprites / 主角精灵",
        chapter.maps.length > 0 ? ["hero"] : [],
        metadataFamilies.filter((family) => family === "hero"),
        ["placeholder player rendering: world runtime still draws the player as a rectangle / 当前玩家在 world runtime 中仍以矩形占位渲染，属于占位主角表现"],
      ),
      buildCategory(
        "npc-sprites",
        "NPC Sprites / NPC 精灵",
        [...npcSprites.map((id) => `npc.${id}`), ...portraitIds.map((id) => `portrait.${id}`)],
        unique([...baseAssetMap.keys(), ...chapterOverrideMap.keys()]).filter((key) => key.startsWith("npc.") || key.startsWith("portrait.")),
        [
          ...collectStateNotes([...npcSprites.map((id) => `npc.${id}`), ...portraitIds.map((id) => `portrait.${id}`)]),
          ...(spriteImageExists ? [] : [`sprite image "${spriteMetadata.imagePath}" is still missing / 精灵图 "${spriteMetadata.imagePath}" 目前仍不存在`]),
        ],
      ),
      buildCategory(
        "enemy-sprites",
        "Enemy Sprites / 敌方精灵",
        unique(chapter.enemyGroups.flatMap((battleGroupId) => battleGroupIndex.get(battleGroupId)?.enemyIds ?? []).map((id) => `enemy.${id}`)),
        [],
        chapter.enemyGroups.length > 0 ? ["enemy sprite registry does not exist yet / 目前还没有敌方精灵注册层"] : [],
      ),
      buildCategory(
        "ui-panels",
        "UI Panels / UI 面板",
        ["ui.dialogue-box", "ui.menu-overlay", "ui.shop-overlay", "ui.battle-panel"],
        unique([...baseAssetMap.keys(), ...chapterOverrideMap.keys()]).filter((key) => key.startsWith("ui.")),
        [
          ...collectStateNotes(["ui.dialogue-box", "ui.menu-overlay", "ui.shop-overlay", "ui.battle-panel"]),
          "UI currently uses code-drawn panels and DOM overlay, not imported panel assets / 当前 UI 仍主要使用代码绘制面板和 DOM overlay，而不是导入面板资源",
        ],
      ),
      buildCategory(
        "icons",
        "Icons / 图标",
        chapter.shops.length > 0 || itemIds.length > 0 ? ["item-icons"] : [],
        [],
        itemIds.length > 0 ? ["item and menu icons are not registered yet / 物品与菜单图标目前尚未建立注册层"] : [],
      ),
      buildCategory(
        "audio",
        "SFX And BGM References / 音效与音乐引用",
        soundIds.map((id) => `audio.${id}`),
        unique([...baseAssetMap.keys(), ...chapterOverrideMap.keys()]).filter((key) => key.startsWith("audio.")),
        soundIds.length > 0
          ? [
            ...collectStateNotes(soundIds.map((id) => `audio.${id}`)),
            "audio references already live in content, but no audio registry or files are present yet / 音频引用已进入内容层，但还没有音频注册层和实际文件",
          ]
          : [],
      ),
    ];

    categories.forEach((category) => {
      category.missingIds.forEach((assetId) => {
        issues.push({
          type: "broken-reference",
          severity: "warning",
          categoryId: category.id,
          path: `chapter:${chapter.chapterId}:${category.id}`,
          message: `chapter "${chapter.chapterId}" references missing asset "${assetId}" in category "${category.id}"`,
        });
      });
      category.unreferencedIds.forEach((assetId) => {
        issues.push({
          type: "unreferenced-resource",
          severity: "warning",
          categoryId: category.id,
          path: `chapter:${chapter.chapterId}:${category.id}`,
          message: `asset "${assetId}" in category "${category.id}" is currently unreferenced by chapter "${chapter.chapterId}"`,
        });
      });
    });

    return {
      chapterId: chapter.chapterId,
      title: chapter.title,
      categories,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      chapterCount: chaptersReport.length,
      issueCount: issues.length,
      placeholderCategories: chaptersReport.flatMap((entry) => entry.categories).filter((entry) => entry.status === "placeholder").length,
    },
    issues,
    chapters: chaptersReport,
  };
}
