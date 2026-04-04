import { writeGlobalTextContinuityReport } from "./lib/globalTextContinuityAudit";

const report = await writeGlobalTextContinuityReport();

console.log("Global Text Continuity Audit / 全局文本连续性审计");
console.log(`Generated At / 生成时间: ${report.generatedAt}`);
console.log(`Chapter Count / 章节数量: ${report.summary.chapterCount}`);
console.log(`Repeated Group Count / 重复文本组数: ${report.summary.repeatedGroupCount}`);
console.log(`Naming Issue Count / 命名问题数: ${report.summary.namingIssueCount}`);
console.log(`Blocker Count / 阻塞项数量: ${report.summary.blockerCount}`);
console.log(`Non-Blocker Count / 非阻塞项数量: ${report.summary.nonBlockerCount}`);
console.log(`Artifacts / 产物目录: ${new URL("../reports/global-text-continuity/latest", import.meta.url).pathname}`);
