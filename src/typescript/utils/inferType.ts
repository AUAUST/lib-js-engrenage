import { deduplicate, isNotEmpty, map } from "@auaust/primitive-kit/arrays";
import { isArray } from "@auaust/toolkit/isArray";
import { isBoolean } from "@auaust/toolkit/isBoolean";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { isString } from "@auaust/toolkit/isString";
import { entries } from "@auaust/toolkit/object";

import { identifierPattern } from "#typescript/constants";
import type { JsonObject } from "#support/json/types/JsonObject";
import type { JsonValue } from "#support/json/types/JsonValue";

function renderKey(key: string): string {
  return identifierPattern.test(key) ? key : JSON.stringify(key);
}

function renderArray(
  items: readonly JsonValue[],
  exact: boolean,
  indent: string,
): string {
  const types = map(items, (item) => {
    return inferType(item, exact, indent);
  });

  if (exact) {
    return `readonly [${types.join(", ")}]`;
  }

  if (!isNotEmpty(types)) {
    return "unknown[]";
  }

  const union = deduplicate(types);

  return union.length === 1
    ? `${union.join("")}[]`
    : `(${union.join(" | ")})[]`;
}

function renderObject(
  object: JsonObject,
  exact: boolean,
  indent: string,
): string {
  const nested = `${indent}  `;

  const modifier = exact ? "readonly " : "";

  const properties: string[] = [];

  for (const [key, value] of entries(object)) {
    if (value !== undefined) {
      properties.push(
        `${nested}${modifier}${renderKey(key)}: ${inferType(value, exact, nested)};`,
      );
    }
  }

  return isNotEmpty(properties)
    ? `{\n${properties.join("\n")}\n${indent}}`
    : "{}";
}

export function inferType(
  value: JsonValue,
  exact: boolean,
  indent = "",
): string {
  if (isArray(value)) {
    return renderArray(value, exact, indent);
  }

  if (isPlainObject(value)) {
    return renderObject(value, exact, indent);
  }

  if (exact || value === null) {
    return JSON.stringify(value);
  }

  if (isString(value)) {
    return "string";
  }

  return isBoolean(value) ? "boolean" : "number";
}
