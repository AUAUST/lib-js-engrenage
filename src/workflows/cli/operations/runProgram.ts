// @debt The `auaust/no-dynamic-import` rule forbids the dynamic imports that keep the config modules off the startup path of commands that never fail, so the rule is disabled here until it allows lazy loading (#221).
/* eslint-disable auaust/no-dynamic-import */

import type { CommandUnknownOpts } from "@commander-js/extra-typings";

import { formatCommandError } from "#workflows/cli/operations/formatCommandError";
import { isDebugEnvironment } from "#workflows/cli/operations/isDebugEnvironment";

function isDebugFlagSet(command: CommandUnknownOpts | null): boolean {
  for (let current = command; current !== null; current = current.parent) {
    if (current.getOptionValue("debug") === true) {
      return true;
    }
  }

  return false;
}

// @debt resolves the config again after a failure instead of reading the config the failing command already resolved
async function isDebugConfigured(): Promise<boolean> {
  try {
    if (isDebugEnvironment()) {
      return true;
    }

    const { debugSection } =
      await import("#workflows/cli/config/sections/debugSection");

    const { loadConfig } = await import("#project/config/index");
    const { validateConfig } = await import("#workflows/config/index");
    const config = validateConfig(await loadConfig());

    return await config.resolve(debugSection);
  } catch {
    return false;
  }
}

export async function runProgram(
  program: CommandUnknownOpts,
  argv?: readonly string[],
): Promise<void> {
  let running: CommandUnknownOpts | null = program;

  program.hook("preAction", (_command, action) => {
    running = action;
  });

  try {
    await program.parseAsync(argv);
  } catch (error) {
    const debug = isDebugFlagSet(running) || (await isDebugConfigured());

    console.error(formatCommandError(error, { debug }));

    process.exitCode = 1;
  }
}
