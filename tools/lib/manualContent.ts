import path from "node:path";
import type { ChapterMetadata } from "./chapterMetadata";
import { loadAllChapterMetadata } from "./chapterMetadata";
import { readJsonFile, repoRoot } from "./importerCore";

export interface ManualStoryContent {
  dialogueLines: Array<{
    id: string;
    speakerName?: string;
    speakerNpcId?: string;
    text?: string;
  }>;
  events: Array<{
    id: string;
    name: string;
    steps: Array<Record<string, unknown>>;
  }>;
  shops: Array<{
    id: string;
    name: string;
    inventory: Array<{
      itemId: string;
      price?: number;
    }>;
  }>;
}

export interface ManualWorldContent {
  maps: Array<{
    id: string;
    name: string;
    width: number;
    height: number;
    collisionLayers: Array<{
      id: string;
      blocked: number[];
      width: number;
      height: number;
    }>;
    portals: Array<{
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
      targetMapId: string;
      targetSpawnId: string;
    }>;
    spawnPoints: Array<{
      id: string;
      x: number;
      y: number;
    }>;
    npcs: Array<{
      id: string;
      name: string;
      x: number;
      y: number;
      facing: string;
      eventId?: string;
      shopId?: string;
    }>;
    triggers: Array<{
      id: string;
      kind: string;
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      npcId?: string;
      eventId?: string;
      encounterTableId?: string;
      once: boolean;
    }>;
  }>;
  items: Array<{
    id: string;
    price: number;
  }>;
  enemies: Array<{
    id: string;
  }>;
  encounterTables: Array<{
    id: string;
    entries: Array<{
      id: string;
      battleGroupId: string;
    }>;
  }>;
}

export const manualStoryPath = path.join(repoRoot, "content", "manual", "story.content.json");
export const manualWorldPath = path.join(repoRoot, "content", "manual", "world.content.json");
export const manualChapterDir = path.join(repoRoot, "content", "manual", "chapters");

export async function loadManualStoryContent(): Promise<ManualStoryContent> {
  return readJsonFile<ManualStoryContent>(manualStoryPath);
}

export async function loadManualWorldContent(): Promise<ManualWorldContent> {
  return readJsonFile<ManualWorldContent>(manualWorldPath);
}

export async function loadRealChapterMetadata(): Promise<ChapterMetadata[]> {
  const chapters = await loadAllChapterMetadata(manualChapterDir);
  return chapters.filter((entry) => entry.chapterId !== "chapter-template");
}
