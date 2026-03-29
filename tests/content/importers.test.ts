import { describe, expect, it } from "vitest";
import { validateContentPack } from "@/content/schema";
import { buildBattleContentPack } from "../../tools/importers/importGameData";
import { stableStringify } from "../../tools/lib/importerCore";

describe("import tools", () => {
  it("builds deterministic generated battle content from source", async () => {
    const firstPack = await buildBattleContentPack();
    const secondPack = await buildBattleContentPack();

    expect(stableStringify(firstPack)).toBe(stableStringify(secondPack));
    expect(validateContentPack(firstPack, "generated-battle-pack").battleGroups[0]?.id).toBe("training-slimes");
    expect(firstPack.enemies[0]?.dropItems[0]?.itemId).toBe("herb");
  });
});
