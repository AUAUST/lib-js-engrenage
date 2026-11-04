import type { JSONPath } from "jsonc-parser";

import type { JsonValue } from "#foundation/json/types/JsonValue";

export interface JsonEdit {
  path: JSONPath;
  value: JsonValue | undefined;
}
