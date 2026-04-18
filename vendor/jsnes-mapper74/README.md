# jsnes Mapper 74 patch / jsnes Mapper 74 补丁

中文：这是项目内对 `jsnes@2.1.0` 的最小补丁，用于验证 Mapper 74/TQROM 风格 ROM 是否能进入帧捕获流程。补丁只修改本地 `node_modules/jsnes/src/mappers/index.js`，把 mapper 74 映射到 jsnes 现有 MMC3 mapper4。它不是完整准确的 Mapper 74 实现；如果能运行，也只能作为私有参考截图探索起点。  
English: This is a minimal project-local patch for `jsnes@2.1.0` to test whether Mapper 74/TQROM-style ROMs can enter the frame-capture flow. It only patches local `node_modules/jsnes/src/mappers/index.js` by mapping mapper 74 to jsnes' existing MMC3 mapper4. It is not a complete accurate Mapper 74 implementation; if it runs, it is only a starting point for private reference capture exploration.
