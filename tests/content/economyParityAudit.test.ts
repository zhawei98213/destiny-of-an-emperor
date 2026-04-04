import { describe, expect, it } from "vitest";
import { buildEconomyParityReport } from "../../tools/lib/economyParityAudit";

describe("economy parity audit", () => {
  it("keeps current imported chapter economy paths traceable", async () => {
    const report = await buildEconomyParityReport();

    expect(report.summary.chapterCount).toBeGreaterThanOrEqual(6);
    expect(report.summary.shopCount).toBeGreaterThanOrEqual(4);
    expect(report.summary.blockerCount).toBe(0);

    const chapterOne = report.itemAvailabilityByChapter.find((entry) => entry.chapterId === "chapter-01-lou-sang");
    expect(chapterOne).toBeTruthy();
    expect(chapterOne?.eventItems).toContain("travel-pass");
    expect(chapterOne?.shopItems).toContain("herb");

    const chapterFive = report.itemAvailabilityByChapter.find(
      (entry) => entry.chapterId === "chapter-05-highland-waystation",
    );
    expect(chapterFive).toBeTruthy();
    expect(chapterFive?.shopItems).toContain("travel-ration");
    expect(chapterFive?.requiredItems).toContain("waystation-badge");

    const starterShop = report.shopInventoryAudit.find((entry) => entry.shopId === "starter-shop");
    expect(starterShop).toBeTruthy();
    expect(starterShop?.inventory.some((entry) => entry.itemId === "bronze-sword")).toBe(true);

    const outlawRewards = report.rewardDropSanityCheck.find((entry) => entry.enemyGroupId === "highland-outlaws");
    expect(outlawRewards).toBeTruthy();
    expect(outlawRewards?.rewardGoldRange.max).toBeGreaterThanOrEqual(16);
  });
});
