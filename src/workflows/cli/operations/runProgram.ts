import type { CommandUnknownOpts } from "@commander-js/extra-typings";

import { formatCommandError } from "#workflows/cli/operations/formatCommandError";
import { isDebugEnvironment } from "#workflows/cli/operations/isDebugEnvironment";
import { runContext } from "#workflows/cli/operations/runContext";

const abortingSignals = ["SIGHUP", "SIGINT", "SIGTERM"] as const;

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

    const { loadValidatedConfig } = await import("#workflows/config/index");

    const config = await loadValidatedConfig();

    return await config.resolve("debug");
  } catch {
    return false;
  }
}

export async function runProgram(
  program: CommandUnknownOpts,
  argv?: readonly string[],
  { signal }: { signal?: AbortSignal } = {},
): Promise<void> {
  let running: CommandUnknownOpts | null = program;

  program.hook("preAction", (_command, action) => {
    running = action;
  });

  const controller = new AbortController();

  const runSignal =
    signal === undefined
      ? controller.signal
      : AbortSignal.any([controller.signal, signal]);

  function stopListening() {
    for (const aborting of abortingSignals) {
      process.off(aborting, abort);
    }
  }

  function abort(received: NodeJS.Signals) {
    controller.abort();
    stopListening();

    process.kill(process.pid, received);
  }

  for (const aborting of abortingSignals) {
    process.once(aborting, abort);
  }

  try {
    await runContext.run({ signal: runSignal }, () => program.parseAsync(argv));
  } catch (error) {
    if (runSignal.aborted) {
      return;
    }

    const { isHookCommand } = await import("#tools/agents/index");

    const debug = isDebugFlagSet(running) || (await isDebugConfigured());

    console.error(formatCommandError(error, { debug }));

    process.exitCode = isHookCommand(argv ?? process.argv) ? 2 : 1;
  } finally {
    stopListening();
  }
}
