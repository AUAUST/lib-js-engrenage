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

    const { loadValidatedConfig } = await import("#workflows/config/index");

    const config = await loadValidatedConfig();

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
    const { isHookCommand } = await import("#tools/agents/index");

    const debug = isDebugFlagSet(running) || (await isDebugConfigured());

    console.error(formatCommandError(error, { debug }));

    process.exitCode = isHookCommand(argv ?? process.argv) ? 2 : 1;
  }
}
