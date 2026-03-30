import { runNpcPlacementCheck } from "./lib/npcPlacementCheck";
import { runCli } from "./lib/importerCore";

await runCli(async () => {
  const report = await runNpcPlacementCheck();
  report.issues.forEach((issue) => {
    console.log(`[npc-placement] ${issue.path} ${issue.message}`);
  });
  console.log(`NPC Placement Check / NPC 摆位检查: maps=${report.checkedMaps} npcs=${report.checkedNpcs} issues=${report.issues.length}`);
  if (report.issues.length > 0) {
    process.exitCode = 1;
  }
});
