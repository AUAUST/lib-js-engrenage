import { isFunction, isString } from "@auaust/toolkit";
import { freeze, keys, record } from "@auaust/toolkit/object";

import { CommandUsageError } from "#nexus/cli/errors/CommandUsageError";
import { createRunOptions } from "#nexus/cli/operations/createRunOptions";
import { describeOptionFlags } from "#nexus/cli/operations/describeOptionFlags";
import { loadCommandFunction } from "#nexus/cli/operations/loadCommandFunction";
import { parseCommandTokens } from "#nexus/cli/operations/parseCommandTokens";
import { readCommandArguments } from "#nexus/cli/operations/readCommandArguments";
import type { CommandPath } from "#nexus/cli/types/CommandPath";
import type { LayerLoader } from "#nexus/cli/types/LayerLoader";
import type { OptionDeclaration } from "#nexus/cli/types/OptionDeclaration";
import type { ParsingCommandDeclaration } from "#nexus/cli/types/ParsingCommandDeclaration";
import type { ProgramDeclaration } from "#nexus/cli/types/ProgramDeclaration";
import type { Resolution } from "#nexus/cli/types/Resolution";
import type { RunOptionValues } from "#nexus/cli/types/RunOptionValues";

type RunOptions = ReturnType<typeof createRunOptions>;

type GivenValues = ReadonlyMap<OptionDeclaration, unknown>;

interface Layers {
  readonly options: readonly OptionDeclaration[];
  readonly choices: readonly (readonly string[] | undefined)[];
}

async function loadLayer<Value>(
  loader: LayerLoader<Value>,
  path: CommandPath,
  name: string,
  kind: string,
): Promise<Value> {
  const resolve = await loadCommandFunction(loader, name, kind);

  return resolve(path);
}

async function loadLayers(
  declaration: ParsingCommandDeclaration,
  path: CommandPath,
): Promise<Layers> {
  const [lists, choices] = await Promise.all([
    Promise.all(
      declaration.options.map((entry) => {
        return isFunction(entry)
          ? loadLayer(entry, path, declaration.name, "options")
          : [entry];
      }),
    ),
    Promise.all(
      declaration.arguments.map(({ choices }) => {
        return isFunction(choices)
          ? loadLayer(choices, path, declaration.name, "choices")
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

function readRunOptions(
  [silent, quiet, verbose, debug, output]: RunOptions,
  values: GivenValues,
): RunOptionValues {
  const scenario = values.get(output);

  return freeze({
    silent: values.has(silent) ? true : undefined,
    quiet: values.has(quiet) ? true : undefined,
    verbose: values.has(verbose) ? true : undefined,
    debug: values.has(debug) ? true : undefined,
    output: isString(scenario) ? scenario : undefined,
  });
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

/**
 * Resolves `args`, the arguments after a program's name, against `program`
 * without loading any action: routes them to a command, each option binding to
 * the command it follows and every argument after a forwarding command's name
 * reaching it raw; loads the layers of each command on the path; then parses and
 * validates each option and argument, the run options at any level of the path.
 * Resolves to the invocation, a request for help or the version, or every usage
 * error found, worded as Commander words them.
 */
export async function resolveInvocation(
  { root, scenarios }: ProgramDeclaration,
  args: readonly string[],
): Promise<Resolution> {
  const runOptions = createRunOptions(keys(scenarios));
  const runValues = new Map<OptionDeclaration, unknown>();
  const errors: CommandUsageError[] = [];
  const names: string[] = [];

  function finish(
    invocation:
      | Omit<Extract<Resolution, { kind: "invocation" }>, "kind" | "runOptions">
      | undefined,
  ): Resolution {
    checkConflicts(runOptions, runValues, errors);

    const values = readRunOptions(runOptions, runValues);

    if (invocation === undefined || errors.length > 0) {
      return {
        kind: "failure",
        path: freeze([...names]),
        errors: freeze(errors),
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

    const layers = await loadLayers(declaration, path);

    const level = parseCommandTokens(
      declaration,
      {
        options: layers.options,
        runOptions,
        runValues,
      },
      rest,
      errors,
    );

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
        version: declaration.version,
        runOptions: readRunOptions(runOptions, runValues),
      };
    }

    checkRequired(layers.options, level.given, errors);
    checkConflicts(layers.options, level.given, errors);

    if (level.route !== undefined) {
      names.push(level.route.declaration.name);

      declaration = level.route.declaration;
      rest = level.route.args;

      continue;
    }

    if (declaration.action === undefined) {
      const [name] = level.positionals;

      if (!level.blocked) {
        errors.push(
          new CommandUsageError(
            name === undefined
              ? "no command given"
              : `unknown command '${name}'`,
          ),
        );
      }

      return finish(undefined);
    }

    const argumentValues = readCommandArguments(
      declaration,
      path,
      layers.choices,
      level.positionals,
      errors,
    );

    if (errors.length > 0) {
      return finish(undefined);
    }

    const parameters = createParameters(
      declaration,
      path,
      layers.options,
      level.given,
      argumentValues,
      errors,
    );

    return finish({
      path,
      declaration,
      parameters: freeze([...parameters]),
    });
  }
}
