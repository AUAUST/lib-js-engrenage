import { CommandUsageError } from "#nexus/cli/errors/CommandUsageError";
import { describeHelp } from "#nexus/cli/operations/describeHelp";
import { getRunContext } from "#nexus/cli/operations/getRunContext";
import { loadCommandFunction } from "#nexus/cli/operations/loadCommandFunction";
import { helpEntry } from "#nexus/cli/utils/helpEntry";
import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
import type { ProgramDeclaration } from "#nexus/cli/types/ProgramDeclaration";
import type { RunResolution } from "#nexus/cli/types/RunResolution";

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

/**
 * Runs `resolution`, what a run's arguments resolve to against `program`, within
 * the caller's run context: prints the help or version it requests through the
 * run's reporter, or loads the command's action and runs it, a chaining command's
 * receiving every invocation. Never exits the process.
 *
 * @throws {CommandUsageError} Every usage error the resolution holds, joined in
 * one when several, after the help of a group it names no command of.
 * @throws {unknown} What the action throws.
 */
export async function executeProgram(
  program: ProgramDeclaration,
  resolution: RunResolution,
): Promise<void> {
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
