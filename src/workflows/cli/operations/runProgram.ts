import type { CommandUnknownOpts } from "@commander-js/extra-typings";

import { isDebugEnvironment } from "#project/config/operations/isDebugEnvironment";
import { formatCommandError } from "#workflows/cli/operations/formatCommandError";
import { loadConfig } from "#workflows/registry/operations/loadConfig";

function isDebugFlagSet(command: CommandUnknownOpts | null): boolean {
  for (let current = command; current !== null; current = current.parent) {
    if (current.getOptionValue("debug") === true) {
      return true;
    }
  }

  return false;
}

// @debt resolves the config again after a failure instead of reading the config the failing command already resolved
async function isConfigDebug(): Promise<boolean> {
  try {
    const config = await loadConfig();

    return config.debug;
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
    const debug =
      isDebugFlagSet(running) ||
      isDebugEnvironment() ||
      (await isConfigDebug());

    console.error(formatCommandError(error, { debug }));

    process.exitCode = 1;
  }
}
