import {
  CommanderError,
  type CommandUnknownOpts,
} from "@commander-js/extra-typings";

import {
  createConsoleReporter,
  type Reporter,
} from "#foundation/reports/index";
import { dropClosedOutput } from "#nexus/cli/operations/dropClosedOutput";
import { formatCommandError } from "#nexus/cli/operations/formatCommandError";
import { isDebugEnvironment } from "#nexus/cli/operations/isDebugEnvironment";
import { runContext } from "#nexus/cli/operations/runContext";
import { toUsageError } from "#nexus/cli/utils/toUsageError";

const abortingSignals = ["SIGHUP", "SIGINT", "SIGTERM"] as const;

function isFlagSet(command: CommandUnknownOpts | null, name: string): boolean {
  for (let current = command; current !== null; current = current.parent) {
    if (current.getOptionValue(name) === true) {
      return true;
    }
  }

  return false;
}

function overrideExits(command: CommandUnknownOpts): void {
  command.exitOverride();

  for (const subcommand of command.commands) {
    overrideExits(subcommand);
  }
}

async function isDebugResolved(
  resolveDebug: ((reporter: Reporter) => Promise<boolean>) | undefined,
  reporter: Reporter,
): Promise<boolean> {
  try {
    return (await resolveDebug?.(reporter)) ?? false;
  } catch {
    return false;
  }
}

/**
 * Runs a program within its run context: aborts it on SIGHUP, SIGINT and
 * SIGTERM, and on failure prints its error, with its stack when the `--debug`
 * flag, `debugVariable` or `resolveDebug` turns debug on, led by what
 * `explain` returns for it.
 */
export async function runProgram(
  program: CommandUnknownOpts,
  argv?: readonly string[],
  {
    signal,
    reporter,
    onError,
    debugVariable,
    resolveDebug,
    explain,
  }: {
    signal?: AbortSignal;
    reporter?: Reporter;
    onError?(error: unknown): void;
    debugVariable?: string;
    resolveDebug?(reporter: Reporter): Promise<boolean>;
    explain?(error: unknown): string | undefined;
  } = {},
): Promise<void> {
  dropClosedOutput(process.stdout);
  dropClosedOutput(process.stderr);

  let running: CommandUnknownOpts | null = program;

  program.hook("preAction", (_command, action) => {
    running = action;
  });

  const runReporter = (
    reporter ??
    createConsoleReporter({
      isVerbose: () => {
        return isFlagSet(running, "verbose");
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

  if (onError !== undefined) {
    overrideExits(program);
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
      if (!(error instanceof CommanderError)) {
        return void onError(error);
      }

      if (error.exitCode !== 0) {
        onError(toUsageError(error));
      }

      return;
    }

    const debug = (
      isFlagSet(running, "debug") ||
      (debugVariable !== undefined && isDebugEnvironment(debugVariable)) ||
      (await isDebugResolved(resolveDebug, runReporter))
    );

    runReporter.error(
      formatCommandError(error, {
        debug,
        debugVariable,
        explanation: explain?.(error),
      }),
    );

    process.exitCode = 1;
  } finally {
    stopListening();
  }
}
