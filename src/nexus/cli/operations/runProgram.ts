import {
  Command,
  CommanderError,
  type CommandUnknownOpts,
} from "@commander-js/extra-typings";

import { isString } from "@auaust/toolkit";
import { join } from "@auaust/toolkit/array";
import { hasOwn, keys } from "@auaust/toolkit/object";

import { verbosityFlags } from "#nexus/cli/constants";
import { CommandUsageError } from "#nexus/cli/errors/CommandUsageError";
import { dropClosedOutput } from "#nexus/cli/operations/dropClosedOutput";
import { executeProgram } from "#nexus/cli/operations/executeProgram";
import { isDebugEnvironment } from "#nexus/cli/operations/isDebugEnvironment";
import { listVerbosityFlags } from "#nexus/cli/operations/listVerbosityFlags";
import { outputSettling } from "#nexus/cli/operations/outputSettling";
import { rejectVerbosityConflict } from "#nexus/cli/operations/rejectVerbosityConflict";
import { reportCommandError } from "#nexus/cli/operations/reportCommandError";
import { runContext } from "#nexus/cli/operations/runContext";
import { toUsageError } from "#nexus/cli/utils/toUsageError";
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
  nexusDetectors,
  nexusScenarios,
  type ScenarioDetector,
  type ScenarioPrinters,
} from "#nexus/scenarios/index";
import type { CommandPath } from "#nexus/cli/types/CommandPath";
import type { ProgramDeclaration } from "#nexus/cli/types/ProgramDeclaration";
import type { RunOptionValues } from "#nexus/cli/types/RunOptionValues";
import type { RunSettings } from "#nexus/cli/types/RunSettings";
import type { VerbosityFlag } from "#nexus/cli/types/VerbosityFlag";

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

function readOutputFlag(
  command: CommandUnknownOpts | null,
): string | undefined {
  for (let current = command; current !== null; current = current.parent) {
    const value: unknown = current.getOptionValue("output");

    if (isString(value)) {
      return value;
    }
  }
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
    debugVariable: string | undefined;
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

async function runDeclaredProgram(
  program: ProgramDeclaration,
  argv: readonly string[] | undefined,
  { signal, onError, debugVariable, resolveDebug, explain }: RunSettings,
): Promise<void> {
  const { scenarios, detectors } = program;

  let flag: VerbosityFlag | undefined;

  let unflagged: Verbosity = (
    debugVariable !== undefined && isDebugEnvironment(debugVariable)
  )
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
    resolved?: CommandPath,
  ): Promise<void> {
    path = resolved;

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
    await runContext.run({ signal: runSignal, reporter: runReporter }, () => {
      return executeProgram(program, (argv ?? process.argv).slice(2), settle);
    });
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

// @debt the Commander path stays until every program runs on the engine
async function runCommanderProgram(
  program: CommandUnknownOpts,
  argv: readonly string[] | undefined,
  {
    signal,
    scenarios = nexusScenarios,
    detectors = nexusDetectors,
    onError,
    debugVariable,
    resolveDebug,
    explain,
  }: RunSettings & {
    scenarios?: ScenarioPrinters;
    detectors?: readonly ScenarioDetector[];
  },
): Promise<void> {
  let running: CommandUnknownOpts | null = program;

  let unflagged: Verbosity = (
    debugVariable !== undefined && isDebugEnvironment(debugVariable)
  )
    ? "debug"
    : "default";

  const output = createPendingPrinter();

  async function settleOutput(
    scenario: string,
    bindings?: ScenarioPrinters,
  ): Promise<void> {
    output.settle(await loadScenarioPrinter(scenario, { scenarios, bindings }));
  }

  async function settleUnbound(): Promise<void> {
    if (output.settled) {
      return;
    }

    const flag = readOutputFlag(running);

    await settleOutput(
      flag !== undefined && hasOwn(scenarios, flag)
        ? flag
        : detectScenario(detectors, scenarios),
    );
  }

  program.hook("preAction", (_command, action) => {
    running = action;

    rejectVerbosityConflict(action);
  });

  async function settleBound(bindings: ScenarioPrinters | undefined) {
    const flag = readOutputFlag(running);

    if (flag !== undefined && !hasOwn(scenarios, flag)) {
      throw new CommandUsageError(
        `option '--output <scenario>' argument '${flag}' is invalid. Allowed choices are ${join(keys(scenarios), ", ")}.`,
      );
    }

    await settleOutput(flag ?? detectScenario(detectors, scenarios), bindings);
  }

  function getFlag() {
    return listVerbosityFlags(running).at(-1);
  }

  function getVerbosity(): Verbosity {
    const flag = getFlag();

    return flag === undefined ? unflagged : verbosityFlags[flag];
  }

  const runReporter = createReporter(
    timeCompletions(filterReports(output, getVerbosity)),
  );

  const { signal: runSignal, stopListening } = listenForAborts(signal);

  if (onError !== undefined) {
    overrideExits(program);
  }

  try {
    await outputSettling.run(settleBound, () => {
      return runContext.run(
        { signal: runSignal, reporter: runReporter },
        () => {
          return program.parseAsync(argv);
        },
      );
    });
  } catch (error) {
    if (runSignal.aborted) {
      return;
    }

    await settleUnbound();

    async function report(): Promise<void> {
      if (
        getFlag() === undefined &&
        unflagged !== "debug" &&
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

    if (onError === undefined) {
      return void (await report());
    }

    if (!(error instanceof CommanderError)) {
      return void (await onError(error, { path: undefined, report }));
    }

    if (error.exitCode !== 0) {
      await onError(toUsageError(error), { path: undefined, report });
    }
  } finally {
    stopListening();
  }

  await settleUnbound();
}

/**
 * Runs a program within its run context: aborts it on SIGHUP, SIGINT and SIGTERM,
 * hands the printer of its output scenario every entry the verbosity its run
 * options set shows, else `debug` when `debugVariable` is on, else `default`,
 * each completion line with the run's total time, and on failure sets the exit
 * code to 1 and prints its error, a usage error alone, any other led by what
 * `explain` returns for it, with its stack at `debug`, which `resolveDebug`
 * also sets when no flag does; the failure handler, when given, receives the
 * error instead, with the command path the run resolved to and this report to
 * run. A declared program runs on nexus's engine, printing for the scenario
 * `--output` names, else the first of its scenarios one of its detectors names,
 * through the printer the resolved command binds to it, else the one the program
 * declares, loaded once the run resolves, before any action loads, and holding
 * the entries reported until then. A Commander program prints for `scenarios`
 * and `detectors` alike, reporting an `--output` naming none of `scenarios` as
 * a usage error, and lets Commander print its usage errors and exit unless the
 * failure handler is given.
 */
// @debt `scenarios` and `detectors` apply only to a Commander program, a declared one carrying its own, until every program runs on the engine
export async function runProgram(
  program: ProgramDeclaration | CommandUnknownOpts,
  argv?: readonly string[],
  settings: RunSettings & {
    scenarios?: ScenarioPrinters;
    detectors?: readonly ScenarioDetector[];
  } = {},
): Promise<void> {
  dropClosedOutput(process.stdout);
  dropClosedOutput(process.stderr);

  await (program instanceof Command
    ? runCommanderProgram(program, argv, settings)
    : runDeclaredProgram(program, argv, settings));
}
