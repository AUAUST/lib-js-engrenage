#!/usr/bin/env node

import { enableCompileCache } from "node:module";

enableCompileCache();

// @debt builds on engrenage's `workflows/cli` helpers until they move to nexus (BL-4e55ba)
const {
  createProgram,
  launch,
  runProgram,
} = await import("#workflows/cli/index");

await launch(async () => {
  const { default: batiment } = await import("#bin/batiment/index");

  await runProgram(createProgram("batiment", batiment));
});
