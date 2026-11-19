import type { CommandUnknownOpts } from "@commander-js/extra-typings";

import {
  createConsoleReporter,
  type Reporter,
} from "#foundation/reports/index";
import { formatCommandError } from "#workflows/cli/operations/formatCommandError";
import { isDebugEnvironment } from "#workflows/cli/operations/isDebugEnvironment";
import { runContext } from "#workflows/cli/operations/runContext";

const abortingSignals = ["SIGHUP", "SIGINT", "SIGTERM"] as const;

function isFlagSet(command: CommandUnknownOpts | null, name: string): boolean {
  for (let current = command; current !== null; current = current.parent) {
    if (current.getOptionValue(name) === true) {
      return true;
    }
  }

  return false;
}

// @debt resolves the config again after a failure instead of reading the config the failing command already resolved
async function isDebugConfigured(reporter: Reporter): Promise<boolean> {
  try {
    if (isDebugEnvironment()) {
      return true;
    }

    const { loadValidatedConfig } = await import("#workflows/config/index");

    const config = await loadValidatedConfig(undefined, { reporter });

    return await config.resolve("debug");
  } catch {
    return false;
  }
}

export async function runProgram(
  program: CommandUnknownOpts,
  argv?: readonly string[],
  {
    signal,
    reporter,
    onError,
  }: {
    signal?: AbortSignal;
    reporter?: Reporter;
    onError?(error: unknown): void;
  } = {},
): Promise<void> {
  let running: CommandUnknownOpts | null = program;
  let verbose = false;

  program.hook("preAction", (_command, action) => {
    running = action;
    verbose = isFlagSet(action, "verbose");
  });

  const runReporter = (
    reporter ??
    createConsoleReporter({
      isVerbose: () => {
        return verbose;
      },
    })
  );

  const controller = new AbortController();

  const runSignal = signal === undefined
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
    await runContext.run({ signal: runSignal, reporter: runReporter }, () => {
      return program.parseAsync(argv);
    });
  } catch (error) {
    if (runSignal.aborted) {
      return;
    }

    if (onError !== undefined) {
      return void onError(error);
    }

    const debug = (
      isFlagSet(running, "debug") || (await isDebugConfigured(runReporter))
    );

    runReporter.error(formatCommandError(error, { debug }));

    process.exitCode = 1;
  } finally {
    stopListening();
  }
}
