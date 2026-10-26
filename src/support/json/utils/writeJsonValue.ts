import { applyEdits, modify, type JSONPath } from "jsonc-parser";

import { formattingOptions } from "#support/json/constants";
import type { JsonValue } from "#support/json/types/JsonValue";
import type { File } from "#types/File";

export function writeJsonValue(
  content: string,
  path: File,
  location: JSONPath,
  value: JsonValue | undefined,
  isArrayInsertion = false,
): string {
  try {
    const edits = modify(content, location, value, {
      formattingOptions,
      isArrayInsertion,
    });

    return applyEdits(content, edits);
  } catch (error) {
    throw new Error(`Cannot set "${location.join(" > ")}" in ${path}`, {
      cause: error,
    });
  }
}
