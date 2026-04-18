import { readFileSync, writeFileSync } from "node:fs";

const mapperIndex = "node_modules/jsnes/src/mappers/index.js";
const source = readFileSync(mapperIndex, "utf8");
if (source.includes("74: Mapper4")) {
  console.log("jsnes mapper74 shim already present");
  process.exit(0);
}
const patched = source.replace("  71: Mapper71,", "  71: Mapper71,\n  // Project-local compatibility shim: Mapper 74 (TQROM/MMC3-family) starts from Mapper4.\n  // This is a capture experiment, not a full accuracy claim.\n  74: Mapper4,");
if (patched === source) {
  console.error("Unable to patch jsnes mapper index: anchor not found");
  process.exit(1);
}
writeFileSync(mapperIndex, patched);
console.log("patched jsnes mapper74 shim");
