import { CommandUsageError } from "#nexus/cli/errors/CommandUsageError";
import { describeHelp } from "#nexus/cli/operations/describeHelp";
import { getRunContext } from "#nexus/cli/operations/getRunContext";
import { loadCommandFunction } from "#nexus/cli/operations/loadCommandFunction";
import { resolveRun } from "#nexus/cli/operations/resolveRun";
import { helpEntry } from "#nexus/cli/utils/helpEntry";
import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
import type { CommandPath } from "#nexus/cli/types/CommandPath";
import type { ProgramDeclaration } from "#nexus/cli/types/ProgramDeclaration";
import type { RunOptionValues } from "#nexus/cli/types/RunOptionValues";
import type { RunResolution } from "#nexus/cli/types/RunResolution";
import type { ScenarioPrinters } from "#nexus/scenarios/index";

function joinErrors(errors: readonly CommandUsageError[]): CommandUsageError {
  const [first, ...others] = errors;

  if (first === undefined) {
    throw new Error("A failed resolution holds no usage error");
  }

  return others.length === 0
    ? first
    : new CommandUsageError(
        errors
          .map(({ message }) => {
            return message;
          })
          .join("\n"),
      );
}

async function loadAction(
  declaration: CommandDeclaration,
): Promise<(...parameters: unknown[]) => unknown> {
  const { action } = declaration;

  if (action === undefined) {
    throw new Error(
      `The ${declaration.name} command resolved without an action`,
    );
  }

  const run = await loadCommandFunction(action, declaration.name, "action");

  getRunContext().signal.throwIfAborted();

  return run;
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

/**
 * Runs `args`, the arguments after a program's name, against `program` within the
 * caller's run context: resolves every invocation they hold, then hands `settle`
 * the run options, the printers the resolved command binds and the command path
 * of the first invocation, as far as it resolved, before any action loads,
 * then prints the help or version they request through the run's reporter, or
 * loads the command's action and runs it, a chaining command's receiving every
 * invocation. Never exits the process.
 *
 * @throws {CommandUsageError} Every usage error the arguments hold, joined in
 * one when several, after the help of a group they name no command of.
 * @throws {unknown} What resolving or the action throws.
 */
export async function executeProgram(
  program: ProgramDeclaration,
  args: readonly string[],
  settle: (
    runOptions: RunOptionValues,
    printers: ScenarioPrinters | undefined,
    path: CommandPath,
  ) => Promise<void>,
): Promise<void> {
  const resolution = await resolveRun(program, args);

  await settle(
    resolution.runOptions,
    readPrinters(resolution),
    resolution.path,
  );

  const { reporter } = getRunContext();

  switch (resolution.kind) {
    case "failure": {
      if (resolution.help !== undefined) {
        reporter.error(helpEntry(await describeHelp(program, resolution.help)));
      }

      throw joinErrors(resolution.errors);
    }

    case "help": {
      return void reporter.log(
        helpEntry(await describeHelp(program, resolution)),
      );
    }

    case "version": {
      return void reporter.log(resolution.version);
    }

    case "invocation": {
      const run = await loadAction(resolution.declaration);

      return void (await run(...resolution.parameters));
    }

    case "chain": {
      const run = await loadAction(resolution.declaration);

      return void (await run(resolution.invocations));
    }
  }
}
