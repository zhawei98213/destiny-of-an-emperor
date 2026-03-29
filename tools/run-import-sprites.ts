import { runCli } from "./lib/importerCore";
import { generateSpriteMetadata } from "./importers/generateSpriteMetadata";

await runCli(async () => {
  await generateSpriteMetadata();
});
