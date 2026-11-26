#!/usr/bin/env node

import { constants, enableCompileCache } from "node:module";

const { directory, status } = enableCompileCache();

if (
  status === constants.compileCacheStatus.ENABLED &&
  directory !== undefined
) {
  process.env.NODE_COMPILE_CACHE = directory;
}

// @debt runs through engrenage's launch and run wrapper, reading engrenage's debug variable and config, until a split CLI finds its host (BL-efac74)
const [
  { createProgram },
  { runEngrenageProgram },
  { launch },
] = await Promise.all([
  import("#nexus/cli/index"),
  import("#tools/nexus/index"),
  import("#workflows/cli/index"),
]);

await launch(async () => {
  const { default: batiment } = await import("#bin/batiment/index");

  await runEngrenageProgram(createProgram("batiment", batiment));
});
