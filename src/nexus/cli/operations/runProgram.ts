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
  createReporter,
  densePrinter,
  filterReports,
  type Printer,
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

// @debt the completion line's total reads the clock since process start until the run's own timings measure it
function timeCompletions(printer: Printer): Printer {
  function print(...[entry, kind]: Parameters<Printer["print"]>) {
    printer.print(
      entry.kind === "completion" && entry.duration === undefined
        ? { ...entry, duration: performance.now() }
        : entry,
      kind,
    );
  }

  return { print };
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
 * hands `printer`, `densePrinter` by default, every entry the verbosity its
 * flags set shows, else `debug` when `debugVariable` is on, else `default`,
 * each completion line with the run's total time, and on failure prints its
 * error, led by what `explain` returns for it, with its stack at `debug`, which
 * `resolveDebug` also sets when no flag does.
 */
export async function runProgram(
  program: CommandUnknownOpts,
  argv?: readonly string[],
  {
    signal,
    printer = densePrinter,
    onError,
    debugVariable,
    resolveDebug,
    explain,
  }: {
    signal?: AbortSignal;
    printer?: Printer;
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

  const runReporter = createReporter(
    timeCompletions(filterReports(printer, getVerbosity)),
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
