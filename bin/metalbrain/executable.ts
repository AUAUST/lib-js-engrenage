#!/usr/bin/env node

import { launch } from "#nexus/cli/launch/index";

// @debt a hook whose program fails to load exits 1 instead of failing open with a message, since the failure handler runs only once the program loads
await launch(async () => {
  const { loadEngrenageProgram } = await import("#workflows/cli/index");

  return loadEngrenageProgram("metalbrain", import.meta.url, async () => {
    const [
      { default: metalbrain },
      { default: hook },
      { dataEntry, lineEntry },
    ] = await Promise.all([
      import("#bin/metalbrain/index"),
      import("#bin/metalbrain/hook/index"),
      import("#nexus/reports/index"),
    ]);

    return {
      root: metalbrain,
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
    };
  });
});
