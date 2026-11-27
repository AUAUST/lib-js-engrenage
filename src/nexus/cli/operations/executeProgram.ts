import { CommandUsageError } from "#nexus/cli/errors/CommandUsageError";
import { describeHelp } from "#nexus/cli/operations/describeHelp";
import { getRunContext } from "#nexus/cli/operations/getRunContext";
import { loadCommandFunction } from "#nexus/cli/operations/loadCommandFunction";
import { resolveInvocation } from "#nexus/cli/operations/resolveInvocation";
import { helpEntry } from "#nexus/cli/utils/helpEntry";
import type { ProgramDeclaration } from "#nexus/cli/types/ProgramDeclaration";
import type { Resolution } from "#nexus/cli/types/Resolution";
import type { RunOptionValues } from "#nexus/cli/types/RunOptionValues";
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

async function invoke({
  declaration,
  parameters,
}: Extract<Resolution, { kind: "invocation" }>): Promise<void> {
  const { action } = declaration;

  if (action === undefined) {
    throw new Error(
      `The ${declaration.name} command resolved without an action`,
    );
  }

  const run = await loadCommandFunction(action, declaration.name, "action");

  getRunContext().signal.throwIfAborted();

  await (declaration.kind === "parsing" && declaration.chain
    ? run([parameters])
    : run(...parameters));
}

/**
 * Runs `args`, the arguments after a program's name, against `program` within
 * the caller's run context: resolves them, then hands `settle` the run options
 * and the printers the resolved command binds before any action loads, then
 * prints the help or version they request through the run's reporter, or loads
 * the command's action and runs it, a chaining command's receiving its one
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
  ) => Promise<void>,
): Promise<void> {
  const resolution = await resolveInvocation(program, args);

  await settle(
    resolution.runOptions,
    resolution.kind === "invocation" &&
      resolution.declaration.kind === "parsing"
      ? resolution.declaration.printers
      : undefined,
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
      return invoke(resolution);
    }
  }
}
