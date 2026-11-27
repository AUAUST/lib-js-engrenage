import { join } from "@auaust/toolkit/array";
import { split, trim } from "@auaust/toolkit/string";

import { CommandUsageError } from "#nexus/cli/errors/CommandUsageError";

function splitValue(value: string, separator: string | undefined): string[] {
  if (separator === undefined) {
    return [value];
  }

  return split(value, separator)
    .map((item) => trim(item))
    .filter((item) => item !== "");
}

/**
 * Parses `value` given to an option or argument into its items: split by
 * `separator` into trimmed items, empty ones dropped, each item in `choices`
 * and mapped by `parse`. An item outside `choices`, or one `parse` rejects with
 * a usage error, adds a usage error led by `invalid` with that item to `errors`
 * and leaves the items `undefined`.
 *
 * @confined
 */
export function parseUsageValue(
  {
    invalid,
    separator,
    choices,
    parse,
  }: {
    invalid(item: string): string;
    separator: string | undefined;
    choices: readonly string[] | undefined;
    parse: ((item: string) => unknown) | undefined;
  },
  value: string,
  errors: CommandUsageError[],
): unknown[] | undefined {
  const items: unknown[] = [];

  let failed = false;

  for (const item of splitValue(value, separator)) {
    if (choices !== undefined && !choices.includes(item)) {
      errors.push(
        new CommandUsageError(
          `${invalid(item)} Allowed choices are ${join(choices, ", ")}.`,
        ),
      );

      failed = true;

      continue;
    }

    try {
      items.push(parse === undefined ? item : parse(item));
    } catch (error) {
      if (!(error instanceof CommandUsageError)) {
        throw error;
      }

      errors.push(new CommandUsageError(`${invalid(item)} ${error.message}`));

      failed = true;
    }
  }

  return failed ? undefined : items;
}
