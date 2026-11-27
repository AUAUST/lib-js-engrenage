import { runPhases } from "#nexus/cli/constants";
import { CommandUsageError } from "#nexus/cli/errors/CommandUsageError";
import { createPhaseTimer } from "#nexus/cli/operations/createPhaseTimer";
import { describeHelp } from "#nexus/cli/operations/describeHelp";
import { getRunContext } from "#nexus/cli/operations/getRunContext";
import { loadCommandFunction } from "#nexus/cli/operations/loadCommandFunction";
import { helpEntry } from "#nexus/cli/utils/helpEntry";
import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
import type { ProgramDeclaration } from "#nexus/cli/types/ProgramDeclaration";
import type { Resolution } from "#nexus/cli/types/Resolution";

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

async function execute(
  program: ProgramDeclaration,
  resolution: Resolution,
  timer: ReturnType<typeof createPhaseTimer>,
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
      return timer.timeAsync(runPhases.execution, async () => {
        reporter.log(helpEntry(await describeHelp(program, resolution)));
      });
    }

    case "version": {
      return void reporter.log(resolution.version);
    }

    case "invocation": {
      const run = await timer.timeAsync(runPhases.action, () => {
        return loadAction(resolution.declaration);
      });

      return timer.timeAsync(runPhases.execution, async () => {
        await run(...resolution.parameters);
      });
    }
  }
}

/**
 * Runs `resolution`, what an invocation resolves to against `program`, within
 * the caller's run context: prints the help or version it requests through the
 * run's reporter, or loads the command's action and runs it; records the time
 * spent loading the action and executing as one measure each in the performance
 * timeline, behind `scope` when given. Never exits the process.
 *
 * @throws {CommandUsageError} Every usage error the resolution holds, joined in
 * one when several, after the help of a group it names no command of.
 * @throws {unknown} What the action throws.
 */
export async function executeProgram(
  program: ProgramDeclaration,
  resolution: Resolution,
  { scope }: { scope?: string } = {},
): Promise<void> {
  const timer = createPhaseTimer(scope);

  try {
    await execute(program, resolution, timer);
  } finally {
    timer.measure();
  }
}
