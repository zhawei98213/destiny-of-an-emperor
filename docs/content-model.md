# Content Model
# 内容模型

`content/source/` stores raw extracted or imported upstream material and should not be loaded directly by the runtime.
`content/source/` 用于存放提取或导入得到的原始上游材料，不应被运行时直接加载。

`content/manual/` stores hand-authored runtime packs such as map layouts, events, dialogue, shops, and placeholder progression data.
`content/manual/` 用于存放手工编写的运行时内容包，例如地图布局、事件、对话、商店和占位进度数据。

`content/generated/` stores machine-generated runtime packs produced from tools or import pipelines. These files must already match runtime schema and are loaded the same way as manual packs.
`content/generated/` 用于存放工具或导入管线生成的运行时内容包。这些文件必须事先满足运行时 schema，并与手工内容包使用同样方式加载。

The runtime loader reads only manifest files from `manual/` and `generated/`, validates each pack against TypeScript-aligned schema, merges the packs into one database, and then runs cross-reference checks across maps, events, shops, battle groups, flags, and save data.
运行时加载器只会读取 `manual/` 和 `generated/` 下的 manifest 文件，先按与 TypeScript 对齐的 schema 校验每个内容包，再把它们合并成一个数据库，最后执行地图、事件、商店、战斗组、标记和存档数据之间的跨引用检查。
