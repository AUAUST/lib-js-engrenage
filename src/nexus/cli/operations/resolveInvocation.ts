import { isFunction } from "@auaust/toolkit";
import { freeze, keys, record } from "@auaust/toolkit/object";

import { helpCommandName, runPhases } from "#nexus/cli/constants";
import { CommandUsageError } from "#nexus/cli/errors/CommandUsageError";
import { createPhaseTimer } from "#nexus/cli/operations/createPhaseTimer";
import { createRunOptions } from "#nexus/cli/operations/createRunOptions";
import { describeOptionFlags } from "#nexus/cli/operations/describeOptionFlags";
import { loadCommandLayer } from "#nexus/cli/operations/loadCommandLayer";
import { parseCommandTokens } from "#nexus/cli/operations/parseCommandTokens";
import { readCommandArguments } from "#nexus/cli/operations/readCommandArguments";
import { readRunOptions } from "#nexus/cli/operations/readRunOptions";
import { findSubcommand } from "#nexus/cli/utils/findSubcommand";
import { suggestName } from "#nexus/cli/utils/suggestName";
import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
import type { CommandPath } from "#nexus/cli/types/CommandPath";
import type { OptionDeclaration } from "#nexus/cli/types/OptionDeclaration";
import type { ParsingCommandDeclaration } from "#nexus/cli/types/ParsingCommandDeclaration";
import type { ProgramDeclaration } from "#nexus/cli/types/ProgramDeclaration";
import type { Resolution } from "#nexus/cli/types/Resolution";

type GivenValues = ReadonlyMap<OptionDeclaration, unknown>;

type PhaseTimer = ReturnType<typeof createPhaseTimer>;

interface Layers {
  readonly options: readonly OptionDeclaration[];
  readonly choices: readonly (readonly string[] | undefined)[];
}

async function loadLayers(
  declaration: ParsingCommandDeclaration,
  path: CommandPath,
): Promise<Layers> {
  const [lists, choices] = await Promise.all([
    Promise.all(
      declaration.options.map((entry) => {
        return isFunction(entry)
          ? loadCommandLayer(entry, path, declaration.name, "options")
          : [entry];
      }),
    ),
    Promise.all(
      declaration.arguments.map(({ choices }) => {
        return isFunction(choices)
          ? loadCommandLayer(choices, path, declaration.name, "choices")
          : choices;
      }),
    ),
  ]);

  return { options: lists.flat(), choices };
}

function readOptionValue(option: OptionDeclaration, given: GivenValues) {
  return given.has(option) ? given.get(option) : option.default;
}

/** @confined */
function checkRequired(
  options: readonly OptionDeclaration[],
  given: GivenValues,
  errors: CommandUsageError[],
): void {
  for (const option of options) {
    if (option.required && readOptionValue(option, given) === undefined) {
      errors.push(
        new CommandUsageError(
          `required option '${describeOptionFlags(option)}' not specified`,
        ),
      );
    }
  }
}

/** @confined */
function checkConflicts(
  options: readonly OptionDeclaration[],
  given: GivenValues,
  errors: CommandUsageError[],
): void {
  const reported: (readonly [OptionDeclaration, OptionDeclaration])[] = [];

  for (const option of options) {
    for (const other of options) {
      if (
        !(
          given.has(option) &&
          given.has(other) &&
          option.conflicts.includes(other.name)
        ) ||
        reported.some(([first, second]) => {
          return first === other && second === option;
        })
      ) {
        continue;
      }

      reported.push([option, other]);

      errors.push(
        new CommandUsageError(
          `option '${describeOptionFlags(option)}' cannot be used with option '${describeOptionFlags(other)}'`,
        ),
      );
    }
  }
}

function recordValues(
  options: readonly OptionDeclaration[],
  given: GivenValues,
): Readonly<Record<string, unknown>> {
  return freeze(
    record(
      options.map((option) => {
        return [option.name, readOptionValue(option, given)];
      }),
    ),
  );
}

/** @confined */
function createParameters(
  declaration: ParsingCommandDeclaration,
  path: CommandPath,
  options: readonly OptionDeclaration[],
  given: GivenValues,
  argumentValues: readonly unknown[],
  errors: CommandUsageError[],
): readonly unknown[] {
  const values = [
    ...argumentValues,
    ...(declaration.options.length > 0
      ? [
          recordValues(
            options.filter((option) => declaration.options.includes(option)),
            given,
          ),
        ]
      : []),
  ];

  if (declaration.parse === undefined) {
    return values;
  }

  try {
    return declaration.parse(...values, {
      path,
      options: recordValues(options, given),
    });
  } catch (error) {
    if (error instanceof CommandUsageError) {
      errors.push(error);

      return values;
    }

    throw error;
  }
}

function rejectCommand(
  declaration: CommandDeclaration,
  name: string,
  {
    isRoot,
    group,
  }: {
    isRoot: boolean;
    group?: readonly string[];
  },
): CommandUsageError {
  const known = declaration.kind === "parsing"
    ? declaration.subcommands.flatMap((subcommand) => {
        return [subcommand.name, ...subcommand.aliases];
      })
    : [];

  return new CommandUsageError(
    `unknown command '${name}'${group === undefined ? "" : ` in '${group.join(" ")}'`}${suggestName(name, isRoot ? [...known, helpCommandName] : known)}`,
  );
}

/** @confined */
function findHelpTarget(
  root: ParsingCommandDeclaration,
  names: readonly string[],
  errors: CommandUsageError[],
):
  | Pick<Extract<Resolution, { kind: "help" }>, "path" | "declaration">
  | undefined {
  const path: string[] = [];

  let declaration: CommandDeclaration = root;

  for (const name of names) {
    const subcommand = findSubcommand(declaration, name);

    if (subcommand === undefined) {
      return void errors.push(
        rejectCommand(declaration, name, {
          isRoot: path.length === 0,
          ...(path.length > 0 && { group: [root.name, ...path] }),
        }),
      );
    }

    path.push(subcommand.name);

    declaration = subcommand;
  }

  return { path: freeze(path), declaration };
}

async function resolvePath(
  { root, scenarios }: ProgramDeclaration,
  args: readonly string[],
  timer: PhaseTimer,
): Promise<Resolution> {
  const runOptions = createRunOptions(keys(scenarios));
  const runValues = new Map<OptionDeclaration, unknown>();
  const errors: CommandUsageError[] = [];
  const names: string[] = [];

  function finish(
    invocation:
      | Omit<Extract<Resolution, { kind: "invocation" }>, "kind" | "runOptions">
      | undefined,
    help?: Extract<Resolution, { kind: "failure" }>["help"],
  ): Resolution {
    timer.time(runPhases.validation, () => {
      checkConflicts(runOptions, runValues, errors);
    });

    const values = readRunOptions(runOptions, runValues);

    if (invocation === undefined || errors.length > 0) {
      return {
        kind: "failure",
        path: freeze([...names]),
        errors: freeze(errors),
        ...(help !== undefined && { help }),
        runOptions: values,
      };
    }

    return {
      kind: "invocation",
      ...invocation,
      runOptions: values,
    };
  }

  let declaration = root;
  let rest = args;

  for (;;) {
    const path = freeze([...names]);

    if (declaration.kind === "forwarding") {
      return finish({
        path,
        declaration,
        parameters: freeze([freeze([...rest])]),
      });
    }

    const current = declaration;

    const layers = await timer.timeAsync(runPhases.layers, () => {
      return loadLayers(current, path);
    });

    const level = timer.time(runPhases.routing, () => {
      return parseCommandTokens(
        current,
        {
          options: layers.options,
          runOptions,
          runValues,
        },
        rest,
        errors,
      );
    });

    if (level.request === "help") {
      return {
        kind: "help",
        path,
        declaration,
        runOptions: readRunOptions(runOptions, runValues),
      };
    }

    if (level.request === "version" && declaration.version !== undefined) {
      return {
        kind: "version",
        path,
        version: declaration.version,
        runOptions: readRunOptions(runOptions, runValues),
      };
    }

    if (
      names.length === 0 &&
      level.route === undefined &&
      !level.blocked &&
      declaration.subcommands.length > 0 &&
      level.positionals[0] === helpCommandName
    ) {
      const target = timer.time(runPhases.routing, () => {
        return findHelpTarget(current, level.positionals.slice(1), errors);
      });

      if (target === undefined || errors.length > 0) {
        return finish(undefined);
      }

      return {
        kind: "help",
        ...target,
        runOptions: readRunOptions(runOptions, runValues),
      };
    }

    timer.time(runPhases.validation, () => {
      checkRequired(layers.options, level.given, errors);
      checkConflicts(layers.options, level.given, errors);
    });

    if (level.route !== undefined) {
      names.push(level.route.declaration.name);

      declaration = level.route.declaration;
      rest = level.route.args;

      continue;
    }

    if (declaration.action === undefined) {
      const [name] = level.positionals;

      if (level.blocked) {
        return finish(undefined);
      }

      if (name === undefined) {
        errors.push(new CommandUsageError("no command given"));

        return finish(undefined, { path, declaration });
      }

      errors.push(
        rejectCommand(declaration, name, { isRoot: names.length === 0 }),
      );

      return finish(undefined);
    }

    const parameters = timer.time(runPhases.validation, () => {
      const argumentValues = readCommandArguments(
        current,
        path,
        layers.choices,
        level.positionals,
        errors,
      );

      return errors.length > 0
        ? undefined
        : createParameters(
            current,
            path,
            layers.options,
            level.given,
            argumentValues,
            errors,
          );
    });

    if (parameters === undefined) {
      return finish(undefined);
    }

    return finish({
      path,
      declaration,
      parameters: freeze([...parameters]),
    });
  }
}

/**
 * Resolves `args`, the arguments after a program's name, against `program`
 * without loading any action: routes them to a command, each option binding to
 * the command it follows and every argument after a forwarding command's name
 * reaching it raw; loads the layers of each command on the path; then parses and
 * validates each option and argument, the run options at any level of the path.
 * A root group reserves the `help` command, whose arguments name the path of
 * the command whose help it requests. Resolves to the invocation, a request for
 * help or the version, or every usage error found, an unknown command or option
 * suggesting the closest known name, and one below the root of a help path naming
 * the group it was looked up in; a path stopping at a group without an action
 * that names no command fails with that group's help. Records the time spent
 * routing, loading layers and validating as one measure each in the performance
 * timeline, behind `scope` when given.
 */
export async function resolveInvocation(
  program: ProgramDeclaration,
  args: readonly string[],
  { scope }: { scope?: string } = {},
): Promise<Resolution> {
  const timer = createPhaseTimer(scope);

  try {
    return await resolvePath(program, args, timer);
  } finally {
    timer.measure();
  }
}
