import { join } from "@auaust/toolkit/array";
import { freeze, keys } from "@auaust/toolkit/object";

import { CommandUsageError } from "#nexus/cli/errors/CommandUsageError";
import { createRunOptions } from "#nexus/cli/operations/createRunOptions";
import { describeOptionFlags } from "#nexus/cli/operations/describeOptionFlags";
import { readRunOptions } from "#nexus/cli/operations/readRunOptions";
import { resolveInvocation } from "#nexus/cli/operations/resolveInvocation";
import { splitInvocations } from "#nexus/cli/utils/splitInvocations";
import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
import type { CommandPath } from "#nexus/cli/types/CommandPath";
import type { OptionDeclaration } from "#nexus/cli/types/OptionDeclaration";
import type { ParsingCommandDeclaration } from "#nexus/cli/types/ParsingCommandDeclaration";
import type { ProgramDeclaration } from "#nexus/cli/types/ProgramDeclaration";
import type { Resolution } from "#nexus/cli/types/Resolution";
import type { RunOptionValues } from "#nexus/cli/types/RunOptionValues";
import type { RunResolution } from "#nexus/cli/types/RunResolution";

interface Chained {
  readonly declaration: ParsingCommandDeclaration;
  readonly name: string;
}

function isChaining(
  declaration: CommandDeclaration,
): declaration is ParsingCommandDeclaration {
  return declaration.kind === "parsing" && declaration.chain;
}

// @debt an `--output` given twice in one invocation keeps the last value, while two invocations giving different ones fail the run
/**
 * Records in `given` the run options `values` sets, adding to `errors` each one
 * conflicting with an option or disagreeing with a value `given` already holds.
 *
 * @confined
 */
function agreeRunOptions(
  runOptions: readonly OptionDeclaration[],
  values: RunOptionValues,
  given: Map<OptionDeclaration, unknown>,
  errors: CommandUsageError[],
): void {
  const earlier = new Map(given);
  const entries: Readonly<Record<string, unknown>> = values;

  for (const option of runOptions) {
    const value = entries[option.name];

    if (value === undefined) {
      continue;
    }

    const conflicting = [...earlier.keys()].find((other) => {
      return option.conflicts.includes(other.name);
    });

    const previous = earlier.get(option);

    if (conflicting !== undefined) {
      errors.push(
        new CommandUsageError(
          `option '${describeOptionFlags(option)}' cannot be used with option '${describeOptionFlags(conflicting)}'`,
        ),
      );
    } else if (earlier.has(option) && previous !== value) {
      errors.push(
        new CommandUsageError(
          `option '${describeOptionFlags(option)}' argument '${String(value)}' disagrees with '${String(previous)}' given earlier in the run`,
        ),
      );
    } else {
      given.set(option, value);
    }
  }
}

function describePath(root: CommandDeclaration, path: CommandPath): string {
  return join([root.name, ...path], " ");
}

/**
 * Checks that `resolution`, one invocation of several, resolves to a chaining
 * command, the same as `chained` when an earlier one did, adding a usage error
 * to `errors` otherwise.
 *
 * @confined
 */
function checkChain(
  resolution: Resolution,
  root: CommandDeclaration,
  chained: Chained | undefined,
  errors: CommandUsageError[],
): Chained | undefined {
  switch (resolution.kind) {
    case "failure": {
      errors.push(...resolution.errors);

      return chained;
    }

    case "help": {
      errors.push(new CommandUsageError("help cannot be chained"));

      return chained;
    }

    case "version": {
      errors.push(new CommandUsageError("--version cannot be chained"));

      return chained;
    }

    case "invocation": {
      const name = describePath(root, resolution.path);

      if (!isChaining(resolution.declaration)) {
        errors.push(
          new CommandUsageError(`command '${name}' cannot be chained`),
        );

        return chained;
      }

      if (
        chained !== undefined &&
        chained.declaration !== resolution.declaration
      ) {
        errors.push(
          new CommandUsageError(
            `command '${name}' cannot be chained with '${chained.name}'`,
          ),
        );
      }

      return chained ?? { declaration: resolution.declaration, name };
    }
  }
}

/**
 * Resolves `args`, the arguments after a program's name, against `program` without
 * loading any action: splits them into invocations on each bare `--next`, a `--`
 * ending the split, and resolves each from the program's root, each naming its
 * full command path. Several invocations must all name the same chaining command;
 * their run options apply to the whole run, a verbosity flag conflicting with
 * another given in an earlier invocation, or an `--output` disagreeing with an
 * earlier one, failing it. A chaining command resolves to its invocations, even
 * one alone. With several invocations, each usage error names the invocation
 * holding it, and the resolution carries the first one's path.
 */
export async function resolveRun(
  program: ProgramDeclaration,
  args: readonly string[],
): Promise<RunResolution> {
  const resolutions = await Promise.all(
    splitInvocations(args).map((invocation) => {
      return resolveInvocation(program, invocation);
    }),
  );

  const [first] = resolutions;

  if (first === undefined) {
    throw new Error("A run split into no invocation");
  }

  if (resolutions.length === 1) {
    return first.kind === "invocation" && isChaining(first.declaration)
      ? {
          kind: "chain",
          path: first.path,
          declaration: first.declaration,
          invocations: freeze([first.parameters]),
          runOptions: first.runOptions,
        }
      : first;
  }

  const runOptions = createRunOptions(keys(program.scenarios));
  const given = new Map<OptionDeclaration, unknown>();
  const errors: CommandUsageError[] = [];
  const invocations: (readonly unknown[])[] = [];

  let chained: Chained | undefined;

  for (const [index, resolution] of resolutions.entries()) {
    const found: CommandUsageError[] = [];

    chained = checkChain(resolution, program.root, chained, found);

    agreeRunOptions(runOptions, resolution.runOptions, given, found);

    if (resolution.kind === "invocation") {
      invocations.push(resolution.parameters);
    }

    errors.push(
      ...found.map(({ message }) => {
        return new CommandUsageError(`invocation ${index + 1}: ${message}`);
      }),
    );
  }

  const values = readRunOptions(runOptions, given);

  if (chained === undefined || errors.length > 0) {
    return {
      kind: "failure",
      path: first.path,
      errors: freeze(errors),
      runOptions: values,
    };
  }

  return {
    kind: "chain",
    path: first.path,
    declaration: chained.declaration,
    invocations: freeze(invocations),
    runOptions: values,
  };
}
