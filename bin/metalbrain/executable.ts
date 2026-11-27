#!/usr/bin/env node

import { constants, enableCompileCache } from "node:module";

const { directory, status } = enableCompileCache();

if (
  status === constants.compileCacheStatus.ENABLED &&
  directory !== undefined
) {
  process.env.NODE_COMPILE_CACHE = directory;
}

// @debt a failure loading the cli barrel crashes a hook instead of failing open, since openHook lives behind it
const {
  launch,
  openHook,
  runExecutable,
} = await import("#workflows/cli/index");

async function runMetalbrain(): Promise<void> {
  const [
    { program },
    { runEngrenageProgram },
    { default: metalbrain },
    { default: hook },
  ] = await Promise.all([
    import("#nexus/cli/index"),
    import("#tools/nexus/index"),
    import("#bin/metalbrain/index"),
    import("#bin/metalbrain/hook/index"),
  ]);

  await runEngrenageProgram(program({ root: metalbrain }), undefined, {
    onError(error, { path, report }) {
      if (path?.[0] === hook.name) {
        return void openHook("metalbrain", error);
      }

      return report();
    },
  });
}

await launch(async () => {
  try {
    await runExecutable(import.meta.url, runMetalbrain);
  } catch (error) {
    // @debt a failure before the run resolves, such as the program failing to load, finds a hook by the first argument, so a run option before `hook` makes it fail loudly
    if (process.argv[2] !== "hook") {
      throw error;
    }

    openHook("metalbrain", error);
  }
});
