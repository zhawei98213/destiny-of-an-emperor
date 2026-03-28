import {
  createEmptyContentDatabase,
  validateContentManifest,
  validateContentPack,
  validateContentReferences,
} from "@/content/schema";
import type { ContentDatabase, ContentManifest, ContentPack } from "@/types/content";

export interface ContentReader {
  readText(path: string): Promise<string>;
}

export class BrowserContentReader implements ContentReader {
  async readText(path: string): Promise<string> {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load content from ${path}.`);
    }

    return response.text();
  }
}

function parseJson(path: string, text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown parse error";
    throw new Error(`[content] ${path}: invalid JSON: ${reason}`);
  }
}

function mergeContentPack(database: ContentDatabase, pack: ContentPack): ContentDatabase {
  database.packs.push(pack.meta);
  database.maps.push(...pack.maps);
  database.dialogueLines.push(...pack.dialogueLines);
  database.events.push(...pack.events);
  database.items.push(...pack.items);
  database.partyMembers.push(...pack.partyMembers);
  database.enemies.push(...pack.enemies);
  database.battleGroups.push(...pack.battleGroups);
  database.shops.push(...pack.shops);
  database.skills.push(...pack.skills);
  database.flags.push(...pack.flags);
  database.questStates.push(...pack.questStates);
  return database;
}

export async function loadContentManifest(
  reader: ContentReader,
  path: string,
): Promise<ContentManifest> {
  const rawText = await reader.readText(path);
  return validateContentManifest(parseJson(path, rawText), path);
}

export async function loadContentPack(
  reader: ContentReader,
  path: string,
): Promise<ContentPack> {
  const rawText = await reader.readText(path);
  return validateContentPack(parseJson(path, rawText), path);
}

export async function loadContentDatabase(
  reader: ContentReader,
  manifestPaths: readonly string[],
): Promise<ContentDatabase> {
  const database = createEmptyContentDatabase();

  for (const manifestPath of manifestPaths) {
    const manifest = await loadContentManifest(reader, manifestPath);
    for (const file of manifest.files) {
      const packPath = `${manifest.root}/${file}`;
      const pack = await loadContentPack(reader, packPath);
      if (pack.meta.kind !== manifest.kind) {
        throw new Error(
          `[content] ${packPath}: pack kind "${pack.meta.kind}" does not match manifest kind "${manifest.kind}"`,
        );
      }

      mergeContentPack(database, pack);
    }
  }

  return validateContentReferences(database);
}
