import {
  CommanderError,
  type CommandUnknownOpts,
} from "@commander-js/extra-typings";

import { isString } from "@auaust/toolkit";
import { join } from "@auaust/toolkit/array";
import { hasOwn, keys } from "@auaust/toolkit/object";

import { verbosityFlags } from "#nexus/cli/constants";
import { CommandUsageError } from "#nexus/cli/errors/CommandUsageError";
import { dropClosedOutput } from "#nexus/cli/operations/dropClosedOutput";
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

/**
 * Runs a program within its run context: aborts it on SIGHUP, SIGINT and
 * SIGTERM, hands the printer of its output scenario every entry the verbosity
 * its flags set shows, else `debug` when `debugVariable` is on, else `default`,
 * each completion line with the run's total time, and on failure prints its
 * error, led by what `explain` returns for it, with its stack at `debug`, which
 * `resolveDebug` also sets when no flag does. The scenario is the one `--output`
 * names, else the first of `scenarios` one of `detectors` names; its printer is
 * the one the running command binds to it, else the one `scenarios` declares,
 * loaded once every invocation of the command parses, before its action loads,
 * and holding the entries reported until then; an `--output` naming none of
 * `scenarios` fails as a usage error.
 */
export async function runProgram(
  program: CommandUnknownOpts,
  argv?: readonly string[],
  {
    signal,
    scenarios = nexusScenarios,
    detectors = nexusDetectors,
    onError,
    debugVariable,
    resolveDebug,
    explain,
  }: {
    signal?: AbortSignal;
    scenarios?: ScenarioPrinters;
    detectors?: readonly ScenarioDetector[];
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

  await settleUnbound();
}
