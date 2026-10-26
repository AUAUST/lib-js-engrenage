import type { JSONPath } from "jsonc-parser";

import type { JsonValue } from "#support/json/types/JsonValue";

export interface JsonEdit {
  path: JSONPath;
  value: JsonValue | undefined;
}
