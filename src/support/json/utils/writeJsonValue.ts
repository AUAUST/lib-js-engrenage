import {
  applyEdits,
  modify,
  type JSONPath,
  type ModificationOptions,
} from "jsonc-parser";

import { formattingOptions } from "#support/json/constants";
import type { JsonValue } from "#support/json/types/JsonValue";
import type { File } from "#types/File";

export function writeJsonValue(
  content: string,
  path: File,
  location: JSONPath,
  value: JsonValue | undefined,
  options: Omit<ModificationOptions, "formattingOptions"> = {},
): string {
  try {
    const edits = modify(content, location, value, {
      isArrayInsertion: false,
      ...options,
      formattingOptions,
    });

    return applyEdits(content, edits);
  } catch (error) {
    throw new Error(`Cannot set "${location.join(" > ")}" in ${path}`, {
      cause: error,
    });
  }
}
