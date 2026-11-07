import { isObject } from "@auaust/toolkit/isObject";

import type { ConfigSchema } from "#scripts/codegen/types/ConfigSchema";

export function isConfigSchema(value: unknown): value is ConfigSchema {
  return isObject(value) && "kind" in value && value.kind === "schema";
}
