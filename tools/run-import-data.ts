import { runCli } from "./lib/importerCore";
import { importGameData } from "./importers/importGameData";

await runCli(async () => {
  await importGameData();
});
