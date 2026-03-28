# Content Model

`content/source/` stores raw extracted or imported upstream material and should not be loaded directly by the runtime.

`content/manual/` stores hand-authored runtime packs such as map layouts, events, dialogue, shops, and placeholder progression data.

`content/generated/` stores machine-generated runtime packs produced from tools or import pipelines. These files must already match runtime schema and are loaded the same way as manual packs.

The runtime loader reads only manifest files from `manual/` and `generated/`, validates each pack against TypeScript-aligned schema, merges the packs into one database, and then runs cross-reference checks across maps, events, shops, battle groups, flags, and save data.
