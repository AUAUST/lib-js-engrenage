#!/usr/bin/env node

import { enableCompileCache } from "node:module";

enableCompileCache();

// @debt a failure loading the cli barrel crashes the hook instead of failing open, since openHook lives behind it
const {
  createProgram,
  openHook,
  runProgram,
} = await import("#workflows/cli/index");

try {
  const { default: metalbrain } = await import("#bin/metalbrain/index");

  await runProgram(createProgram("metalbrain", metalbrain), process.argv, {
    onError(error) {
      openHook("metalbrain", error);
    },
  });
} catch (error) {
  openHook("metalbrain", error);
}
