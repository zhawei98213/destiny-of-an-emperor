const { readFileSync, writeFileSync } = require('node:fs');
const mapperIndex = 'node_modules/nes-emu/cartridge/mappers/index.js';
const source = readFileSync(mapperIndex, 'utf8');
if (source.includes('_default[74] = _4_MMC.default')) {
  console.log('nes-emu mapper74 shim already present');
  process.exit(0);
}
const patched = source.replace('var _default = exports.default = _lodash.default.keyBy([_0_NROM2.default, _1_MMC.default, _2_UxROM2.default, _3_CNROM2.default, _4_MMC.default], "id");', 'var _default = exports.default = _lodash.default.keyBy([_0_NROM2.default, _1_MMC.default, _2_UxROM2.default, _3_CNROM2.default, _4_MMC.default], "id");\n// Project-local compatibility shim: Mapper 74 (TQROM/MMC3-family) starts from MMC3.\n// Capture experiment only, not a full accuracy claim.\n_default[74] = _4_MMC.default;');
if (patched === source) {
  console.error('Unable to patch nes-emu mapper index: anchor not found');
  process.exit(1);
}
writeFileSync(mapperIndex, patched);
console.log('patched nes-emu mapper74 shim');
