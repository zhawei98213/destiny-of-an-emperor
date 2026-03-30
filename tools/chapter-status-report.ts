import {
  buildChapterImportStatusReport,
  formatChapterImportStatusReport,
  writeChapterImportStatusReport,
} from "./lib/chapterFactory";
import { runCli } from "./lib/importerCore";

await runCli(async () => {
  const report = await buildChapterImportStatusReport();
  await writeChapterImportStatusReport(report);
  console.log(formatChapterImportStatusReport(report));
});
