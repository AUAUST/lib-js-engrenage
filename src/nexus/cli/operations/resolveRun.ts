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
import type { ProgramDeclaration } from "#nexus/cli/types/ProgramDeclaration";
import type { Resolution } from "#nexus/cli/types/Resolution";
import type { RunOptionValues } from "#nexus/cli/types/RunOptionValues";
import type { RunResolution } from "#nexus/cli/types/RunResolution";

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

async function measureInvocation(
  program: ProgramDeclaration,
  args: readonly string[],
  position: number,
): Promise<Resolution> {
  const scope = `invocation ${position}`;
  const start = performance.now();

  try {
    return await resolveInvocation(program, args, { scope });
  } finally {
    performance.measure(scope, { start, end: performance.now() });
  }
}

function readScenario(resolution: Resolution): string | undefined {
  return resolution.kind === "invocation" || resolution.kind === "failure"
    ? resolution.scenario
    : undefined;
}

function describePath(root: CommandDeclaration, path: CommandPath): string {
  return join([root.name, ...path], " ");
}

/**
 * Adds to `errors` the usage errors keeping `resolution`, one invocation of
 * several, from chaining.
 *
 * @confined
 */
function checkChainable(
  resolution: Resolution,
  root: CommandDeclaration,
  errors: CommandUsageError[],
): void {
  switch (resolution.kind) {
    case "failure": {
      errors.push(...resolution.errors);

      break;
    }

    case "help": {
      errors.push(new CommandUsageError("help cannot be chained"));

      break;
    }

    case "version": {
      errors.push(new CommandUsageError("--version cannot be chained"));

      break;
    }

    case "invocation": {
      if (!resolution.chainable) {
        errors.push(
          new CommandUsageError(
            `command '${describePath(root, resolution.path)}' cannot be chained`,
          ),
        );
      }
    }
  }
}

/**
 * Resolves `args`, the arguments after a program's name, against `program`
 * without loading any action: splits them into invocations on each bare `--next`,
 * a `--` ending the split, and resolves each from the program's root, each
 * naming its full command path. A run of one invocation resolves as it alone
 * does; several resolve to their chain, each one chainable. Their run options
 * apply to the whole run, a verbosity flag conflicting with another given in an
 * earlier invocation, or an `--output` disagreeing with an earlier one, failing
 * it. With several invocations, each usage error names the invocation holding
 * it, the resolution carries the first one's path and scenario, and each one's
 * resolution is measured in the performance timeline as `invocation <n>`, holding
 * the measures of its phases.
 */
export async function resolveRun(
  program: ProgramDeclaration,
  args: readonly string[],
): Promise<RunResolution> {
  const split = splitInvocations(args);

  const resolutions = await Promise.all(
    split.map((invocation, index) => {
      return split.length === 1
        ? resolveInvocation(program, invocation)
        : measureInvocation(program, invocation, index + 1);
    }),
  );

  const [first] = resolutions;

  if (first === undefined) {
    throw new Error("A run split into no invocation");
  }

  if (resolutions.length === 1) {
    return first;
  }

  const runOptions = createRunOptions(keys(program.scenarios));
  const given = new Map<OptionDeclaration, unknown>();
  const errors: CommandUsageError[] = [];
  const invocations: Extract<Resolution, { kind: "invocation" }>[] = [];

  for (const [index, resolution] of resolutions.entries()) {
    const found: CommandUsageError[] = [];

    checkChainable(resolution, program.root, found);

    agreeRunOptions(runOptions, resolution.runOptions, given, found);

    if (resolution.kind === "invocation") {
      invocations.push(resolution);
    }

    errors.push(
      ...found.map(({ message }) => {
        return new CommandUsageError(`invocation ${index + 1}: ${message}`);
      }),
    );
  }

  const values = readRunOptions(runOptions, given);

  const scenario = readScenario(first);

  if (errors.length > 0) {
    return {
      kind: "failure",
      path: first.path,
      errors: freeze(errors),
      ...(scenario !== undefined && { scenario }),
      runOptions: values,
    };
  }

  return {
    kind: "chain",
    path: first.path,
    invocations: freeze(invocations),
    ...(scenario !== undefined && { scenario }),
    runOptions: values,
  };
}
