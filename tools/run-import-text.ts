import { runCli } from "./lib/importerCore";
import { importTextTables } from "./importers/importTextTables";

await runCli(async () => {
  await importTextTables();
});
