#!/usr/bin/env node

import { enableCompileCache } from "node:module";
import { text } from "node:stream/consumers";

const time = Date.now();

enableCompileCache();

try {
  const { runMetalbrain } = await import("#tools/agents/metalbrain/index");

  await runMetalbrain(process.argv.slice(2), await text(process.stdin), {
    root: process.cwd(),
    time,
  });
} catch {
  // @debt fails open without a trace, so a broken logger shows only as missing lines
}

process.exitCode = 0;
