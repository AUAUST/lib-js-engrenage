import { isFunction } from "@auaust/toolkit/isFunction";

import { isConfigSchema } from "#scripts/codegen/utils/isConfigSchema";
import type { ConfigSchema } from "#scripts/codegen/types/ConfigSchema";

export function getLazyConfigSchema(
  schema: ConfigSchema,
): ConfigSchema | undefined {
  if (
    schema.type !== "lazy" ||
    !("getter" in schema) ||
    !isFunction(schema.getter)
  ) {
    return;
  }

  const target: unknown = schema.getter(undefined);

  return isConfigSchema(target) ? target : undefined;
}
