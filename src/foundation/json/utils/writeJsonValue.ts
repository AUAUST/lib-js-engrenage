import {
  applyEdits,
  modify,
  type JSONPath,
  type ModificationOptions,
} from "jsonc-parser";

import type { JsonIndentation } from "#foundation/json/types/JsonIndentation";
import type { JsonValue } from "#foundation/json/types/JsonValue";
import type { File } from "#types/File";

export function writeJsonValue(
  content: string,
  path: File,
  location: JSONPath,
  value: JsonValue | undefined,
  indentation: JsonIndentation,
  options: Omit<ModificationOptions, "formattingOptions"> = {},
): string {
  try {
    const edits = modify(content, location, value, {
      isArrayInsertion: false,
      ...options,
      formattingOptions: indentation,
    });

    return applyEdits(content, edits);
  } catch (error) {
    throw new Error(`Cannot set "${location.join(" > ")}" in ${path}`, {
      cause: error,
    });
  }
}
