import {
  description,
  literal,
  optional,
  pipe,
  union,
  type GenericSchema,
} from "valibot";

import { describeDefault } from "#foundation/options/utils/describeDefault";
import type { Default } from "#foundation/options/types/Default";
import type { Description } from "#foundation/options/types/Description";

export function createOptionSchema(
  core: GenericSchema,
  options: {
    description: Description | undefined;
    fallback: Default<unknown, never> | undefined;
    optional: boolean;
    disabled: boolean;
  },
): GenericSchema {
  const lines = [
    ...(options.description === undefined ? [] : [options.description].flat()),
    ...(options.fallback === undefined
      ? []
      : [`@default ${describeDefault(options.fallback)}`]),
  ];

  const flagged = options.disabled ? union([literal(false), core]) : core;

  const described =
    lines.length === 0 ? flagged : pipe(flagged, description(lines.join("\n")));

  return options.optional ? optional(described) : described;
}
