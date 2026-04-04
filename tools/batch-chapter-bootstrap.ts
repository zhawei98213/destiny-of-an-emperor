import {
  bootstrapChapterBatch,
  parseChapterBootstrapArgs,
} from "./lib/chapterFactory";
import { runCli } from "./lib/importerCore";

await runCli(async () => {
  const result = await bootstrapChapterBatch(parseChapterBootstrapArgs());
  console.log(`Batch Chapter Bootstrap / 批量章节初始化: ${result.chapterId}`);
  console.log("Created Files / 已创建文件:");
  result.createdFiles.forEach((filePath) => {
    console.log(`- ${filePath}`);
  });
  console.log("Created Directories / 已创建目录:");
  result.createdDirectories.forEach((directoryPath) => {
    console.log(`- ${directoryPath}`);
  });
  console.log(`Checklist / 清单: ${result.checklistPath}`);
  console.log(`Summary / 摘要: ${result.summaryPath}`);
});
