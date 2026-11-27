import { keys } from "@auaust/toolkit/object";

import { runPhases, verbosityFlags } from "#nexus/cli/constants";
import { CommandUsageError } from "#nexus/cli/errors/CommandUsageError";
import { dropClosedOutput } from "#nexus/cli/operations/dropClosedOutput";
import { executeProgram } from "#nexus/cli/operations/executeProgram";
import { isDebugEnvironment } from "#nexus/cli/operations/isDebugEnvironment";
import { reportCommandError } from "#nexus/cli/operations/reportCommandError";
import { resolveRun } from "#nexus/cli/operations/resolveRun";
import { runContext } from "#nexus/cli/operations/runContext";
import { timingsEntry } from "#nexus/cli/utils/timingsEntry";
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
import type { Resolution } from "#nexus/cli/types/Resolution";
import type { RunOptionValues } from "#nexus/cli/types/RunOptionValues";
import type { RunResolution } from "#nexus/cli/types/RunResolution";
import type { RunSettings } from "#nexus/cli/types/RunSettings";
import type { VerbosityFlag } from "#nexus/cli/types/VerbosityFlag";

const abortingSignals = ["SIGHUP", "SIGINT", "SIGTERM"] as const;

// @debt a run's total time reads the clock since process start until the run's own timings measure it
function timeCompletions(printer: Printer, readStart: () => number): Printer {
  function print(...[entry, kind]: Parameters<Printer["print"]>) {
    printer.print(
      entry.kind === "completion" && entry.duration === undefined
        ? { ...entry, duration: performance.now() - readStart() }
        : entry,
      kind,
    );
  }

  return { print };
}

function readProcessStart(): number {
  return 0;
}

function readRunTimings(
  startup: PerformanceMeasure,
  started: number,
): PerformanceEntry[] {
  const entries = [
    ...performance.getEntriesByType("mark"),
    ...performance.getEntriesByType("measure"),
  ];

  return [startup, ...entries.filter(({ startTime }) => startTime >= started)];
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

function readScenario(resolution: RunResolution): string | undefined {
  return resolution.kind === "help" || resolution.kind === "version"
    ? undefined
    : resolution.scenario;
}

function readPrinters(resolution: RunResolution): ScenarioPrinters | undefined {
  return resolution.kind === "invocation" &&
    resolution.declaration.kind === "parsing"
    ? resolution.declaration.printers
    : undefined;
}

function isFailingExitCode(code: typeof process.exitCode): boolean {
  return code != null && Number(code) !== 0;
}

function describeStop(position: number, total: number): string {
  const skipped = position + 1 === total
    ? `invocation ${total}`
    : `invocations ${position + 1} to ${total}`;

  return position === total
    ? `invocation ${position} failed`
    : `invocation ${position} failed; ${skipped} did not run`;
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
 * options set shows, else `debug` when `<ROOT>_DEBUG`, `<ROOT>` its root's
 * name in upper case, is `1` or `true`, else `default`, a single invocation's
 * completion lines with the run's total time, and on failure sets the exit
 * code to 1 and prints its error, a usage error alone, any other led by what
 * `explain` returns for it, with its stack at `debug`, which `resolveDebug` also
 * sets when no flag does; the failure handler, when given, receives the error
 * instead, with the command path the run resolved to, its arguments, the run's
 * reporter and this report to run. It prints for the scenario `--output` names,
 * else, unless the run asks for help or the version, the one the deepest command
 * of its first invocation's path declares, else the first of its scenarios one
 * of its detectors names, through the printer the resolved command binds to it,
 * else the one the program declares, loaded once the run resolves, before any
 * action loads, and holding the entries reported until then. A chain runs its
 * invocations in order, each in a run context of its own whose reporter prints
 * through the printer its command binds to the run's scenario, so a memo keyed
 * by reporter reads afresh what earlier invocations wrote, and whose completion
 * lines carry its own time; the first one failing, by an error or a failing
 * exit code, stops the rest, with a warning naming it and those it skips, and a
 * chain running every invocation ends on a completion line counting them, with
 * the run's total time. Once the run ends unaborted, it reports the marks and
 * measures of the performance timeline since it started, behind the time from
 * process start to the run's, as a table: with `--timings` at any verbosity
 * but `silent`, otherwise as a debug report; it measures its own phases, each
 * invocation's routing, source and layer loading and validation, then the
 * action's loading and execution.
 */
export async function runProgram(
  program: ProgramDeclaration,
  argv?: readonly string[],
  { signal, onError, resolveDebug, explain }: RunSettings = {},
): Promise<void> {
  const startup = performance.measure(runPhases.startup);
  const started = performance.now();

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

  const args = (argv ?? process.argv).slice(2);

  const output = createPendingPrinter();

  let path: CommandPath | undefined;

  let printer: Printer | undefined;

  let scenario: string | undefined;

  let timed = false;

  async function settle(
    runOptions: RunOptionValues | undefined,
    {
      declared,
      bindings,
    }: {
      declared?: string | undefined;
      bindings?: ScenarioPrinters | undefined;
    } = {},
  ): Promise<void> {
    flag = keys(verbosityFlags)
      .filter((name) => {
        return runOptions?.[name] === true;
      })
      .at(-1);

    timed = runOptions?.timings === true;

    scenario = (
      runOptions?.output ?? declared ?? detectScenario(detectors, scenarios)
    );

    printer = await loadScenarioPrinter(scenario, { scenarios, bindings });

    output.settle(
      timeCompletions(filterReports(printer, getVerbosity), readProcessStart),
    );
  }

  async function createSegmentReporter(
    invocation: Resolution,
  ): Promise<{ reporter: Reporter; start(): void }> {
    if (printer === undefined || scenario === undefined) {
      throw new Error("A chain runs before its run settles its printer");
    }

    const bindings = readPrinters(invocation);

    const segmentPrinter = bindings === undefined
      ? printer
      : await loadScenarioPrinter(scenario, { scenarios, bindings });

    let segmentStarted = performance.now();

    function start() {
      segmentStarted = performance.now();
    }

    const reporter = createReporter(
      timeCompletions(filterReports(segmentPrinter, getVerbosity), () => {
        return segmentStarted;
      }),
    );

    return {
      reporter,
      start,
    };
  }

  const runReporter = createReporter(output);

  function reportTimings() {
    const entry = timingsEntry(readRunTimings(startup, started));

    if (timed && printer !== undefined && getVerbosity() !== "silent") {
      printer.print(entry, "debug");
    } else {
      runReporter.debug(entry);
    }
  }

  const { signal: runSignal, stopListening } = listenForAborts(signal);

  async function runChain(invocations: readonly Resolution[]): Promise<void> {
    const segments = await Promise.all(
      invocations.map(async (invocation) => {
        return {
          invocation,
          ...(await createSegmentReporter(invocation)),
        };
      }),
    );

    for (const [index, { invocation, reporter, start }] of segments.entries()) {
      const position = index + 1;

      start();

      try {
        await runContext.run({ signal: runSignal, reporter }, () => {
          return executeProgram(program, invocation, {
            scope: `invocation ${position}`,
          });
        });
      } catch (error) {
        if (!runSignal.aborted) {
          runReporter.warn(describeStop(position, invocations.length));
        }

        throw error;
      }

      if (isFailingExitCode(process.exitCode)) {
        return void runReporter.warn(
          describeStop(position, invocations.length),
        );
      }
    }

    runReporter.complete(`${invocations.length} invocations completed`);
  }

  try {
    await runContext.run(
      { signal: runSignal, reporter: runReporter },
      async () => {
        const resolution = await resolveRun(program, args);

        path = resolution.path;

        await settle(resolution.runOptions, {
          declared: readScenario(resolution),
          bindings: readPrinters(resolution),
        });

        await (resolution.kind === "chain"
          ? runChain(resolution.invocations)
          : executeProgram(program, resolution));
      },
    );
  } catch (error) {
    if (runSignal.aborted) {
      return;
    }

    if (!output.settled) {
      await settle(undefined);
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

    await (onError === undefined
      ? report()
      : onError(error, {
          args,
          path,
          reporter: runReporter,
          report,
        }));
  } finally {
    stopListening();
  }

  if (!runSignal.aborted) {
    reportTimings();
  }
}
