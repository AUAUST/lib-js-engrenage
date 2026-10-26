import type { JSONPath } from "jsonc-parser";

import { flatMap } from "@auaust/primitive-kit/arrays";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { entries } from "@auaust/toolkit/object";

import type { JsonEdit } from "#support/json/types/JsonEdit";
import type { JsonObject } from "#support/json/types/JsonObject";

export function flattenJsonObject(
  object: JsonObject,
  parent: JSONPath = [],
): JsonEdit[] {
  return flatMap(entries(object), ([key, value]) => {
    const path = [...parent, key];

    if (isPlainObject(value)) {
      return flattenJsonObject(value, path);
    }

    return [
      {
        path,
        value,
      },
    ];
  });
}
