#!/usr/bin/env node

import { enableCompileCache } from "node:module";

enableCompileCache();

// @debt a failure loading the cli barrel crashes a hook instead of failing open, since openHook lives behind it
const {
  createProgram,
  launch,
  openHook,
  runProgram,
} = await import("#workflows/cli/index");

// @debt finds the command path by the first argument instead of from Commander's parse, so a run option before `hook` makes the hook fail loudly
const isHook = process.argv[2] === "hook";

async function loadProgram() {
  const { default: metalbrain } = await import("#bin/metalbrain/index");

  return createProgram("metalbrain", metalbrain);
}

if (isHook) {
  try {
    await runProgram(await loadProgram(), process.argv, {
      onError(error) {
        openHook("metalbrain", error);
      },
    });
  } catch (error) {
    openHook("metalbrain", error);
  }
} else {
  await launch(async () => {
    await runProgram(await loadProgram());
  });
}
