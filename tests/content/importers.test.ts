import { describe, expect, it } from "vitest";
import { validateContentPack } from "@/content/schema";
import { buildMapImportReport } from "../../tools/importers/importMapContent";
import { buildBattleContentPack } from "../../tools/importers/importGameData";
import { stableStringify } from "../../tools/lib/importerCore";

describe("import tools", () => {
  it("builds deterministic map staging output from multiple source files", async () => {
    const firstReport = await buildMapImportReport();
    const secondReport = await buildMapImportReport();

    expect(stableStringify(firstReport)).toBe(stableStringify(secondReport));
    expect(firstReport.sourceFiles).toEqual([
      "demo-maps.source.json",
      "east-road-relay.source.json",
      "lou-sang-village.source.json",
      "river-ford-camp.source.json",
    ]);
    expect(firstReport.maps).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "town",
        name: "Lou Sang Village",
        sourceFile: "lou-sang-village.source.json",
        npcCount: 3,
        portalCount: 0,
        spawnPointCount: 2,
        triggerCount: 4,
      }),
      expect.objectContaining({
        id: "field",
        sourceFile: "demo-maps.source.json",
      }),
      expect.objectContaining({
        id: "river-ford",
        sourceFile: "river-ford-camp.source.json",
        npcCount: 3,
        portalCount: 1,
        spawnPointCount: 2,
        triggerCount: 4,
      }),
    ]));
  });

  it("builds deterministic generated battle content from source", async () => {
    const firstPack = await buildBattleContentPack();
    const secondPack = await buildBattleContentPack();

    expect(stableStringify(firstPack)).toBe(stableStringify(secondPack));
    expect(validateContentPack(firstPack, "generated-battle-pack").battleGroups[0]?.id).toBe("training-slimes");
    expect(firstPack.enemies[0]?.dropItems[0]?.itemId).toBe("herb");
  });
});
