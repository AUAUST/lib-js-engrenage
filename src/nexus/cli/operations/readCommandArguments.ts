import { isArray } from "@auaust/toolkit";
import { join } from "@auaust/toolkit/array";

import { CommandUsageError } from "#nexus/cli/errors/CommandUsageError";
import { parseUsageValue } from "#nexus/cli/operations/parseUsageValue";
import type { ArgumentDeclaration } from "#nexus/cli/types/ArgumentDeclaration";
import type { CommandPath } from "#nexus/cli/types/CommandPath";
import type { ParsingCommandDeclaration } from "#nexus/cli/types/ParsingCommandDeclaration";

/** @confined */
function readArgument(
  argument: ArgumentDeclaration,
  choices: readonly string[] | undefined,
  items: readonly string[],
  errors: CommandUsageError[],
): unknown {
  function read(value: string, previous: unknown): unknown {
    return parseUsageValue(
      {
        invalid: `command-argument value '${value}' is invalid for argument '${argument.name}'.`,
        choices,
        parse: argument.parse,
      },
      value,
      previous,
      errors,
    );
  }

  const missing = new CommandUsageError(
    `missing required argument '${argument.name}'`,
  );

  if (argument.variadic) {
    const value = items.length === 0
      ? []
      : items.reduce<unknown>((previous, item) => {
          return read(item, previous);
        }, undefined);

    if (!argument.optional && isArray(value) && value.length === 0) {
      errors.push(missing);
    }

    return value;
  }

  const [item] = items;

  if (item === undefined) {
    if (!argument.optional) {
      errors.push(missing);
    }

    return;
  }

  return read(item, undefined);
}

/**
 * Reads the value of each argument the command at `path` declares from its
 * positional arguments, each in `choices` when the argument has them, a variadic
 * one taking every remaining value, adding a usage error to `errors` for each
 * one missing, invalid or in excess.
 *
 * @confined
 */
export function readCommandArguments(
  declaration: ParsingCommandDeclaration,
  path: CommandPath,
  choices: readonly (readonly string[] | undefined)[],
  positionals: readonly string[],
  errors: CommandUsageError[],
): unknown[] {
  const declared = declaration.arguments;

  const values = declared.map((argument, index) => {
    return readArgument(
      argument,
      choices[index],
      argument.variadic
        ? positionals.slice(index)
        : positionals.slice(index, index + 1),
      errors,
    );
  });

  if (
    declared.at(-1)?.variadic !== true &&
    positionals.length > declared.length
  ) {
    const subject = path.length > 0 ? ` for '${declaration.name}'` : "";
    const plural = declared.length === 1 ? "" : "s";

    errors.push(
      new CommandUsageError(
        `too many arguments${subject}. Expected ${declared.length} argument${plural} but got ${positionals.length}: ${join(positionals, ", ")}.`,
      ),
    );
  }

  return values;
}
