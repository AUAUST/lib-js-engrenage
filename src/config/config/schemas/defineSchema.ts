import {
  boolean,
  custom,
  optional,
  pipe,
  record,
  regex,
  strictObject,
  string,
  transform,
  union,
  type GenericSchema,
} from "valibot";

import { every, includes } from "@auaust/primitive-kit/arrays";
import { isFinite } from "@auaust/primitive-kit/numbers";
import { isArray } from "@auaust/toolkit/isArray";
import { isBoolean } from "@auaust/toolkit/isBoolean";
import { isFunction } from "@auaust/toolkit/isFunction";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { isString } from "@auaust/toolkit/isString";
import { values } from "@auaust/toolkit/object";

import {
  defaultGlobalScope,
  definitionKey,
  globalNamePattern,
  globalScopes,
} from "#config/constants";
import type { Definition } from "#config/types/Definition";
import type { Globals } from "#config/types/Globals";
import type { GlobalsFactory } from "#config/types/GlobalsFactory";
import type { GlobalValue } from "#config/types/GlobalValue";
import type { ResolvedGlobal } from "#config/types/ResolvedGlobal";
import type { ResolvedGlobals } from "#config/types/ResolvedGlobals";
import type { JsonValue } from "#support/json/types/JsonValue";

function isDefinition(input: unknown): input is Definition {
  return isPlainObject(input) && input[definitionKey] === true;
}

function isJsonValue(input: unknown): input is JsonValue {
  if (
    input === null ||
    isString(input) ||
    isBoolean(input) ||
    isFinite(input)
  ) {
    return true;
  }

  if (isArray(input)) {
    return every(input, isJsonValue);
  }

  return (
    isPlainObject(input) &&
    !isDefinition(input) &&
    every(values(input), isJsonValue)
  );
}

function isValidDefinition(input: unknown): input is Definition {
  return (
    isDefinition(input) &&
    isJsonValue(input.value) &&
    isBoolean(input.exact) &&
    (input.type === undefined || isString(input.type)) &&
    includes(globalScopes, input.scope) &&
    (input.description === undefined ||
      (isString(input.description) && !input.description.includes("*/")))
  );
}

function resolveGlobal(value: GlobalValue): ResolvedGlobal {
  if (isDefinition(value)) {
    return {
      expression: JSON.stringify(value.value),
      value: value.value,
      exact: value.exact,
      type: value.type,
      scope: value.scope,
      description: value.description,
    };
  }

  return {
    expression: JSON.stringify(value),
    value,
    exact: false,
    type: undefined,
    scope: defaultGlobalScope,
    description: undefined,
  };
}

function isGlobalValue(input: unknown): input is GlobalValue {
  return isValidDefinition(input) || isJsonValue(input);
}

const globalValueSchema: GenericSchema<GlobalValue, ResolvedGlobal> = pipe(
  custom<GlobalValue>(
    isGlobalValue,
    "Expected a JSON value (null, a boolean, a finite number, a string, an array or a plain object) or a valid top-level definition",
  ),
  transform(resolveGlobal),
);

export const globalsSchema: GenericSchema<Globals, ResolvedGlobals> = record(
  pipe(
    string(),
    regex(
      globalNamePattern,
      "Expected an identifier or a dotted path such as import.meta.env.NAME",
    ),
  ),
  globalValueSchema,
);

export const defineSchema = strictObject({
  types: optional(boolean()),
  values: optional(union([globalsSchema, custom<GlobalsFactory>(isFunction)])),
});
