import { writeNpcGlobalStateReport } from "./lib/npcGlobalStateAudit";

const report = await writeNpcGlobalStateReport();

console.log("NPC Global State Audit / NPC 全局状态审计");
console.log(`Generated At / 生成时间: ${report.generatedAt}`);
console.log(`Chapter Count / 章节数量: ${report.summary.chapterCount}`);
console.log(`NPC Count / NPC 数量: ${report.summary.npcCount}`);
console.log(`Blocker Count / 阻塞项数量: ${report.summary.blockerCount}`);
console.log(`Non-Blocker Count / 非阻塞项数量: ${report.summary.nonBlockerCount}`);
console.log(`Artifacts / 产物目录: ${new URL("../reports/npc-global-state/latest", import.meta.url).pathname}`);
