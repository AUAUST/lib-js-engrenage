import { join } from "@auaust/toolkit/array";

import { CommandUsageError } from "#nexus/cli/errors/CommandUsageError";

/**
 * Parses `value` given to an option or argument, with its value so far; a value
 * outside `choices`, or one `parse` rejects with a usage error, adds a usage
 * error led by `invalid` to `errors` and keeps the value so far.
 *
 * @confined
 */
export function parseUsageValue(
  {
    invalid,
    choices,
    parse,
  }: {
    invalid: string;
    choices: readonly string[] | undefined;
    parse(value: string, previous: unknown): unknown;
  },
  value: string,
  previous: unknown,
  errors: CommandUsageError[],
): unknown {
  if (choices !== undefined && !choices.includes(value)) {
    errors.push(
      new CommandUsageError(
        `${invalid} Allowed choices are ${join(choices, ", ")}.`,
      ),
    );

    return previous;
  }

  try {
    return parse(value, previous);
  } catch (error) {
    if (error instanceof CommandUsageError) {
      errors.push(new CommandUsageError(`${invalid} ${error.message}`));

      return previous;
    }

    throw error;
  }
}
