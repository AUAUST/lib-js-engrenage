#!/usr/bin/env node

import { enableCompileCache } from "node:module";

import { createProgram, launch, runProgram } from "#workflows/cli/index";

enableCompileCache();

await launch(async () => {
  const { default: engrenage } = await import("#bin/engrenage/index");

  await runProgram(createProgram("engrenage", engrenage));
});
