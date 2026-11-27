#!/usr/bin/env node

import { constants, enableCompileCache } from "node:module";

const { directory, status } = enableCompileCache();

if (
  status === constants.compileCacheStatus.ENABLED &&
  directory !== undefined
) {
  process.env.NODE_COMPILE_CACHE = directory;
}

// @debt each bin repeats the compile-cache preamble and the program loading around `runExecutable`, which jscpd reports as a clone of `bin/batiment/executable.ts`
const [
  { program },
  { runEngrenageProgram },
  { launch, runExecutable },
] = await Promise.all([
  import("#nexus/cli/index"),
  import("#tools/nexus/index"),
  import("#workflows/cli/index"),
]);

await launch(async () => {
  await runExecutable(import.meta.url, async () => {
    const { default: engrenage } = await import("#bin/engrenage/index");

    await runEngrenageProgram(program({ root: engrenage }));
  });
});
