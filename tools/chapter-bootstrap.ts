import {
  bootstrapChapterScaffold,
  parseChapterBootstrapArgs,
} from "./lib/chapterFactory";
import { runCli } from "./lib/importerCore";

await runCli(async () => {
  const result = await bootstrapChapterScaffold(parseChapterBootstrapArgs());
  console.log(`Chapter Bootstrap / 章节骨架创建: ${result.chapterId}`);
  result.createdFiles.forEach((filePath) => {
    console.log(`- ${filePath}`);
  });
});
