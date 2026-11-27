#!/usr/bin/env node

import { constants, enableCompileCache } from "node:module";

const { directory, status } = enableCompileCache();

if (
  status === constants.compileCacheStatus.ENABLED &&
  directory !== undefined
) {
  process.env.NODE_COMPILE_CACHE = directory;
}

const [
  { program },
  { dataEntry, lineEntry },
  { runEngrenageProgram },
  { launch, runExecutable },
] = await Promise.all([
  import("#nexus/cli/index"),
  import("#nexus/reports/index"),
  import("#tools/nexus/index"),
  import("#workflows/cli/index"),
]);

// @debt a hook whose program fails to load exits 1 instead of failing open with a message, since the failure handler runs only once the program loads
await launch("metalbrain", async () => {
  await runExecutable(import.meta.url, async () => {
    const [{ default: metalbrain }, { default: hook }] = await Promise.all([
      import("#bin/metalbrain/index"),
      import("#bin/metalbrain/hook/index"),
    ]);

    await runEngrenageProgram(program({ root: metalbrain }), undefined, {
      async onError(error, { args, path, reporter, report }) {
        if (path?.[0] !== hook.name) {
          return report();
        }

        const {
          toFailOpenOutput,
        } = await import("#metalbrain/runtimes/hooks/index");

        const output = toFailOpenOutput([metalbrain.name, ...args], error);

        reporter.log(dataEntry(output, [lineEntry(output.systemMessage)]));
      },
    });
  });
});
