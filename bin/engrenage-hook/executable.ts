#!/usr/bin/env node

import { enableCompileCache } from "node:module";

enableCompileCache();

// @debt a failure loading the cli barrel crashes the hook instead of failing open, since openHook lives behind it
const {
  CommandUsageError,
  createProgram,
  openHook,
  runProgram,
} = await import("#workflows/cli/index");

try {
  const { default: hook } = await import("#bin/engrenage-hook/index");

  await runProgram(createProgram("engrenage-hook", hook), process.argv, {
    onError(error) {
      openHook(
        "engrenage-hook",
        error instanceof CommandUsageError
          ? `${error.message}; regenerate the hooks with pnpm install, then pnpm engrenage sync`
          : error,
      );
    },
  });
} catch (error) {
  openHook("engrenage-hook", error);
}
