import { runCli } from "./lib/importerCore";
import { importMapContent } from "./importers/importMapContent";

await runCli(async () => {
  await importMapContent();
});
