import { function_, looseObject, string } from "valibot";
import type { StandardSchemaV1 } from "@standard-schema/spec";

import { freeze } from "@auaust/toolkit/object";

import type { Conventions } from "#project/format/types/Conventions";

export const conventions: Readonly<Conventions> = freeze({
  indent: "spaces",
  indentWidth: 2,
  lineWidth: 80,
  quotes: "double",
  semicolons: true,
  trailingCommas: "all",
  endOfLine: "lf",
});

export const complexityLimits = freeze({
  cognitiveComplexity: 20, // @debt target is 15 max
  functionLines: 125, // @debt target is 100
  fileLines: 350,
} as const);

export const exportGroups = freeze([
  freeze({
    name: "value-export",
    typeOnly: false,
    wildcard: false,
  }),
  freeze({
    name: "type-export",
    typeOnly: true,
    wildcard: false,
  }),
  freeze({
    name: "value-wildcard-export",
    typeOnly: false,
    wildcard: true,
  }),
  freeze({
    name: "type-wildcard-export",
    typeOnly: true,
    wildcard: true,
  }),
] as const);

// @debt maps conventions onto jsonc-parser input, yet JSON has no tool domain to map at its boundary; thirteen callers import it and pass it on, so JSON files ignore the configurable `format` section
export const jsonIndentation = freeze({
  insertSpaces: conventions.indent === "spaces",
  tabSize: conventions.indentWidth,
} as const);

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const formatterEntry: StandardSchemaV1 = looseObject({
  name: string(),
  package: string(),
  load: function_(),
});
