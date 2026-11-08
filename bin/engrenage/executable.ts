#!/usr/bin/env node

import { createProgram, launch, runProgram } from "#workflows/cli/index";

await launch(async () => {
  const { default: engrenage } = await import("#bin/engrenage/index");

  await runProgram(createProgram("engrenage", engrenage));
});
