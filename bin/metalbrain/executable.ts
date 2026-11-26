#!/usr/bin/env node

import { enableCompileCache } from "node:module";

enableCompileCache();

// @debt a failure loading the cli barrel crashes a hook instead of failing open, since openHook lives behind it
const { launch, openHook } = await import("#workflows/cli/index");

// @debt finds the command path by the first argument instead of from Commander's parse, so a run option before `hook` makes the hook fail loudly
const isHook = process.argv[2] === "hook";

async function runMetalbrain(
  options: { onError?(error: unknown): void } = {},
): Promise<void> {
  const [
    { createProgram },
    { runEngrenageProgram },
    { default: metalbrain },
  ] = await Promise.all([
    import("#nexus/cli/index"),
    import("#tools/nexus/index"),
    import("#bin/metalbrain/index"),
  ]);

  await runEngrenageProgram(
    createProgram("metalbrain", metalbrain),
    undefined,
    options,
  );
}

if (isHook) {
  try {
    await runMetalbrain({
      onError(error) {
        openHook("metalbrain", error);
      },
    });
  } catch (error) {
    openHook("metalbrain", error);
  }
} else {
  await launch(runMetalbrain);
}
