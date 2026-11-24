import {
  array,
  boolean,
  number,
  object,
  optional,
  record,
  string,
  union,
  unknown,
} from "valibot";

import { freeze } from "@auaust/toolkit/object";

// @debt valibot's schema types hold mutable arrays in their type-only `~types` and `~standard.types` members, so the read-only check is disabled instead of passing on the schema types
// eslint-disable-next-line auaust/readonly-constants -- the only mutable members are type-only, absent at runtime
export const environmentPresetFields = freeze({
  name: string(),
  languages: optional(
    array(
      union([
        string(),
        object({
          name: string(),
          options: optional(record(string(), unknown())),
        }),
      ]),
    ),
  ),
  execution: optional(
    object({
      globals: optional(string()),
      apis: optional(array(string())),
      syntax: optional(union([number(), string()])),
      module: optional(string()),
    }),
  ),
  bundled: optional(boolean()),
});

export const environmentMetadataFile = ".environment.json";
