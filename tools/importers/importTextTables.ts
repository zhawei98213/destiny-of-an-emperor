import path from "node:path";
import { generatedRoot, sourceRoot, writeStableJsonFile } from "../lib/importerCore";
import { loadTextSource } from "../lib/sourceSchemas";

export interface TextImportReport {
  generatedAt: "stable";
  importer: "text-tables";
  dialogueLineIds: string[];
  eventIds: string[];
}

const sourceFile = path.join(sourceRoot, "text", "demo-text.source.json");
const outputFile = path.join(generatedRoot, "import-staging", "text-tables.generated.json");

export async function buildTextImportReport(): Promise<TextImportReport> {
  const source = await loadTextSource(sourceFile);
  return {
    generatedAt: "stable",
    importer: "text-tables",
    dialogueLineIds: source.dialogueLines.map((line) => line.id),
    eventIds: source.events.map((event) => event.id),
  };
}

export async function importTextTables(): Promise<void> {
  await writeStableJsonFile(outputFile, await buildTextImportReport());
  console.log(`Generated ${path.relative(process.cwd(), outputFile)}`);
}
