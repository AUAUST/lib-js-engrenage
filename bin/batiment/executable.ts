#!/usr/bin/env node

import { constants, enableCompileCache } from "node:module";

const { directory, status } = enableCompileCache();

if (
  status === constants.compileCacheStatus.ENABLED &&
  directory !== undefined
) {
  process.env.NODE_COMPILE_CACHE = directory;
}

// @debt runs through engrenage's launch and run wrapper, reading engrenage's config, until a split CLI finds its host (BL-efac74)
const [
  { program },
  { runEngrenageProgram },
  { launch, runExecutable },
] = await Promise.all([
  import("#nexus/cli/index"),
  import("#tools/nexus/index"),
  import("#workflows/cli/index"),
]);

await launch("batiment", async () => {
  await runExecutable(import.meta.url, async () => {
    const { default: batiment } = await import("#bin/batiment/index");

    await runEngrenageProgram(program({ root: batiment }));
  });
});
