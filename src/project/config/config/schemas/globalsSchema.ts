import {
  check,
  pipe,
  rawTransform,
  record,
  regex,
  string,
  unknown,
  type GenericSchema,
} from "valibot";

import { globalNamePattern } from "#project/config/constants";
import { isDefinition } from "#project/config/utils/isDefinition";
import { isValidDefinition } from "#project/config/utils/isValidDefinition";
import { resolveGlobal } from "#project/config/utils/resolveGlobal";
import type { ResolvedGlobal } from "#project/config/types/ResolvedGlobal";
import type { ResolvedGlobals } from "#project/config/types/ResolvedGlobals";

const globalValueSchema: GenericSchema<unknown, ResolvedGlobal> = pipe(
  unknown(),
  check((input) => {
    return !isDefinition(input) || isValidDefinition(input);
  }, "Expected a valid top-level definition"),
  rawTransform(({ dataset, addIssue, NEVER }) => {
    try {
      return resolveGlobal(dataset.value);
    } catch (error) {
      addIssue({
        message: error instanceof Error ? error.message : String(error),
      });

      return NEVER;
    }
  }),
);

export const globalsSchema: GenericSchema<
  Readonly<Record<string, unknown>>,
  ResolvedGlobals
> = record(
  pipe(
    string(),
    regex(
      globalNamePattern,
      "Expected an identifier or a dotted path such as import.meta.env.NAME",
    ),
  ),
  globalValueSchema,
);
