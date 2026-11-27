import {
  CommanderError,
  type CommandUnknownOpts,
} from "@commander-js/extra-typings";

import { verbosityFlags } from "#nexus/cli/constants";
import { dropClosedOutput } from "#nexus/cli/operations/dropClosedOutput";
import { isDebugEnvironment } from "#nexus/cli/operations/isDebugEnvironment";
import { listVerbosityFlags } from "#nexus/cli/operations/listVerbosityFlags";
import { rejectVerbosityConflict } from "#nexus/cli/operations/rejectVerbosityConflict";
import { reportCommandError } from "#nexus/cli/operations/reportCommandError";
import { runContext } from "#nexus/cli/operations/runContext";
import { toUsageError } from "#nexus/cli/utils/toUsageError";
import {
  createConsoleReporter,
  filterReports,
  type Reporter,
  type Verbosity,
} from "#nexus/reports/index";

const abortingSignals = ["SIGHUP", "SIGINT", "SIGTERM"] as const;

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
 * Runs a program within its run context: aborts it on SIGHUP, SIGINT and SIGTERM,
 * filters every report by the verbosity its flags set, else `debug` when
 * `debugVariable` is on, else `default`, and on failure prints its error, led by
 * what `explain` returns for it, with its stack at `debug`, which `resolveDebug`
 * also sets when no flag does.
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

  let unflagged: Verbosity = (
    debugVariable !== undefined && isDebugEnvironment(debugVariable)
  )
    ? "debug"
    : "default";

  program.hook("preAction", (_command, action) => {
    running = action;

    rejectVerbosityConflict(action);
  });

  function getFlag() {
    return listVerbosityFlags(running).at(-1);
  }

  function getVerbosity(): Verbosity {
    const flag = getFlag();

    return flag === undefined ? unflagged : verbosityFlags[flag];
  }

  const runReporter = reporter === undefined
    ? createConsoleReporter({ verbosity: getVerbosity })
    : filterReports(reporter, getVerbosity);

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

    // @debt `resolveDebug` raises the level only once the run fails, so a configured debug never shows the debug reports printed before
    if (
      getFlag() === undefined &&
      unflagged !== "debug" &&
      (await isDebugResolved(resolveDebug, runReporter))
    ) {
      unflagged = "debug";
    }

    reportCommandError(error, {
      reporter: runReporter,
      debug: getVerbosity() === "debug",
      debugVariable,
      explanation: explain?.(error),
    });

    process.exitCode = 1;
  } finally {
    stopListening();
  }
}
