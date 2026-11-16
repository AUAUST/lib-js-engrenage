import { isFinite } from "@auaust/primitive-kit/numbers";
import { isArray, isBoolean, isPlainObject, isString } from "@auaust/toolkit";

import { isDefinition } from "#project/config/utils/isDefinition";

export function assertSerializable(key: string, value: unknown): unknown {
  if (isDefinition(value)) {
    throw new TypeError("Expected define() only as a top-level definition");
  }

  if (
    value == null ||
    isString(value) ||
    isBoolean(value) ||
    isFinite(value) ||
    isArray(value) ||
    isPlainObject(value)
  ) {
    return value;
  }

  throw new TypeError(
    key === ""
      ? "Expected a JSON-serializable value"
      : `Expected a JSON-serializable value at key "${key}"`,
  );
}
