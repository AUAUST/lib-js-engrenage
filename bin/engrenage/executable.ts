#!/usr/bin/env node

import { enableCompileCache } from "node:module";

import {
  createProgram,
  enableLinkedSource,
  findSourceExecutable,
  launch,
  runProgram,
} from "#workflows/cli/index";

enableCompileCache();

await launch(async () => {
  await enableLinkedSource(import.meta.url);

  const source = await findSourceExecutable(
    import.meta,
    "#bin/engrenage/executable",
  );

  if (source !== undefined) {
    return void (await import(source));
  }

  const { default: engrenage } = await import("#bin/engrenage/index");

  await runProgram(createProgram("engrenage", engrenage));
});
