import { keys } from "@auaust/toolkit/object";

import { verbosityFlags } from "#nexus/cli/constants";
import { CommandUsageError } from "#nexus/cli/errors/CommandUsageError";
import { dropClosedOutput } from "#nexus/cli/operations/dropClosedOutput";
import { executeProgram } from "#nexus/cli/operations/executeProgram";
import { isDebugEnvironment } from "#nexus/cli/operations/isDebugEnvironment";
import { reportCommandError } from "#nexus/cli/operations/reportCommandError";
import { resolveRun } from "#nexus/cli/operations/resolveRun";
import { runContext } from "#nexus/cli/operations/runContext";
import { toDebugVariable } from "#nexus/cli/utils/toDebugVariable";
import {
  createReporter,
  filterReports,
  type Printer,
  type ReportEntry,
  type Reporter,
  type ReportKind,
  type Verbosity,
} from "#nexus/reports/index";
import {
  detectScenario,
  loadScenarioPrinter,
  type ScenarioPrinters,
} from "#nexus/scenarios/index";
import type { CommandPath } from "#nexus/cli/types/CommandPath";
import type { ProgramDeclaration } from "#nexus/cli/types/ProgramDeclaration";
import type { RunOptionValues } from "#nexus/cli/types/RunOptionValues";
import type { RunResolution } from "#nexus/cli/types/RunResolution";
import type { RunSettings } from "#nexus/cli/types/RunSettings";
import type { VerbosityFlag } from "#nexus/cli/types/VerbosityFlag";

const abortingSignals = ["SIGHUP", "SIGINT", "SIGTERM"] as const;

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

function createPendingPrinter(): Printer & {
  readonly settled: boolean;
  settle(printer: Printer): void;
} {
  const pending: (readonly [ReportEntry, ReportKind])[] = [];

  let target: Printer | undefined;

  function print(entry: ReportEntry, kind: ReportKind) {
    if (target === undefined) {
      pending.push([entry, kind]);
    } else {
      target.print(entry, kind);
    }
  }

  function settle(printer: Printer) {
    target = printer;

    for (const [entry, kind] of pending.splice(0)) {
      printer.print(entry, kind);
    }
  }

  return {
    get settled() {
      return target !== undefined;
    },
    print,
    settle,
  };
}

function readPrinters(resolution: RunResolution): ScenarioPrinters | undefined {
  switch (resolution.kind) {
    case "invocation": {
      return resolution.declaration.kind === "parsing"
        ? resolution.declaration.printers
        : undefined;
    }

    case "chain": {
      return resolution.declaration.printers;
    }

    default:
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

function listenForAborts(signal: AbortSignal | undefined): {
  signal: AbortSignal;
  stopListening(): void;
} {
  const controller = new AbortController();

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

  return {
    signal: signal === undefined
      ? controller.signal
      : AbortSignal.any([controller.signal, signal]),
    stopListening,
  };
}

// @debt `resolveDebug` raises the level only once the run fails, so a configured debug never shows the debug reports printed before
/** @effectful */
function reportFailure(
  error: unknown,
  {
    reporter,
    debug,
    debugVariable,
    explain,
  }: {
    reporter: Reporter;
    debug: boolean;
    debugVariable: string;
    explain: ((error: unknown) => string | undefined) | undefined;
  },
): void {
  process.exitCode = 1;

  if (error instanceof CommandUsageError) {
    return void reporter.error(error.message);
  }

  reportCommandError(error, {
    reporter,
    debug,
    debugVariable,
    explanation: explain?.(error),
  });
}

/**
 * Runs a program within its run context: aborts it on SIGHUP, SIGINT and SIGTERM,
 * hands the printer of its output scenario every entry the verbosity its run
 * options set shows, else `debug` when `<ROOT>_DEBUG`, `<ROOT>` its root's name
 * in upper case, is `1` or `true`, else `default`, each completion line with
 * the run's total time, and on failure sets the exit code to 1 and prints its
 * error, a usage error alone, any other led by what `explain` returns for it,
 * with its stack at `debug`, which `resolveDebug` also sets when no flag does;
 * the failure handler, when given, receives the error instead, with the command
 * path the run resolved to and this report to run. It prints for the scenario
 * `--output` names, else the first of its scenarios one of its detectors names,
 * through the printer the resolved command binds to it, else the one the program
 * declares, loaded once the run resolves, before any action loads, and holding
 * the entries reported until then.
 */
export async function runProgram(
  program: ProgramDeclaration,
  argv?: readonly string[],
  { signal, onError, resolveDebug, explain }: RunSettings = {},
): Promise<void> {
  dropClosedOutput(process.stdout);
  dropClosedOutput(process.stderr);

  const { root, scenarios, detectors } = program;

  const debugVariable = toDebugVariable(root.name);

  let flag: VerbosityFlag | undefined;

  let unflagged: Verbosity = isDebugEnvironment(debugVariable)
    ? "debug"
    : "default";

  function getVerbosity(): Verbosity {
    return flag === undefined ? unflagged : verbosityFlags[flag];
  }

  const output = createPendingPrinter();

  let path: CommandPath | undefined;

  async function settle(
    runOptions: RunOptionValues | undefined,
    bindings: ScenarioPrinters | undefined,
  ): Promise<void> {
    flag = keys(verbosityFlags)
      .filter((name) => {
        return runOptions?.[name] === true;
      })
      .at(-1);

    const printer = await loadScenarioPrinter(
      runOptions?.output ?? detectScenario(detectors, scenarios),
      { scenarios, bindings },
    );

    output.settle(timeCompletions(filterReports(printer, getVerbosity)));
  }

  const runReporter = createReporter(output);

  const { signal: runSignal, stopListening } = listenForAborts(signal);

  try {
    await runContext.run(
      { signal: runSignal, reporter: runReporter },
      async () => {
        const resolution = await resolveRun(
          program,
          (argv ?? process.argv).slice(2),
        );

        path = resolution.path;

        await settle(resolution.runOptions, readPrinters(resolution));

        await executeProgram(program, resolution);
      },
    );
  } catch (error) {
    if (runSignal.aborted) {
      return;
    }

    if (!output.settled) {
      await settle(undefined, undefined);
    }

    async function report(): Promise<void> {
      if (
        flag === undefined &&
        unflagged !== "debug" &&
        !(error instanceof CommandUsageError) &&
        (await isDebugResolved(resolveDebug, runReporter))
      ) {
        unflagged = "debug";
      }

      reportFailure(error, {
        reporter: runReporter,
        debug: getVerbosity() === "debug",
        debugVariable,
        explain,
      });
    }

    await (onError === undefined ? report() : onError(error, { path, report }));
  } finally {
    stopListening();
  }
}
