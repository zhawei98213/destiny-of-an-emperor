import { writeOverworldNavigationParityReport } from "./lib/overworldNavigationParity";

const report = await writeOverworldNavigationParityReport();

console.log("Overworld Navigation Parity / 大地图导航一致性");
console.log(`Generated At / 生成时间: ${report.generatedAt}`);
console.log(`Chapter Count / 章节数量: ${report.summary.chapterCount}`);
console.log(`Map Count / 地图数量: ${report.summary.mapCount}`);
console.log(`Chapter Edge Count / 章节连接数量: ${report.summary.chapterEdgeCount}`);
console.log(`Blocker Count / 阻塞项数量: ${report.summary.blockerCount}`);
console.log(`Non-Blocker Count / 非阻塞项数量: ${report.summary.nonBlockerCount}`);
console.log(`Artifacts / 产物目录: ${new URL("../reports/overworld-navigation/latest", import.meta.url).pathname}`);
