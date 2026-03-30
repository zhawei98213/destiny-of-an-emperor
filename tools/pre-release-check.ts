import { runCli } from "./lib/importerCore";
import { runPreReleaseCli } from "./lib/preReleaseCheck";

await runCli(async () => {
  await runPreReleaseCli(process.argv.slice(2));
});
