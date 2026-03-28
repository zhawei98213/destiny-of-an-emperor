import { validateGameContent } from "@/content/schemaValidator";
import type { GameContent } from "@/types/content";

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

export async function loadGameContent(
  reader: ContentReader,
  path: string,
): Promise<GameContent> {
  const rawText = await reader.readText(path);
  const parsed = JSON.parse(rawText) as unknown;
  return validateGameContent(parsed);
}
