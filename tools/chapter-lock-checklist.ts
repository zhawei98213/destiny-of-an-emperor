import {
  parseChapterIdArg,
  writeChapterLockChecklist,
} from "./lib/chapterFactory";
import { runCli } from "./lib/importerCore";

await runCli(async () => {
  const chapterId = parseChapterIdArg();
  const targetPath = await writeChapterLockChecklist(chapterId);
  console.log(`Chapter Lock Checklist / 章节锁定清单: ${chapterId}`);
  console.log(targetPath);
});
