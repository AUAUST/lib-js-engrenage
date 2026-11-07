import { isArray } from "@auaust/toolkit/isArray";

import { isConfigSchema } from "#scripts/codegen/utils/isConfigSchema";
import { isUnionConfigSchema } from "#scripts/codegen/utils/isUnionConfigSchema";
import type { ConfigSchema } from "#scripts/codegen/types/ConfigSchema";

export function getCoreConfigSchema(schema: ConfigSchema): ConfigSchema {
  if ("pipe" in schema && isArray(schema.pipe)) {
    return getCoreConfigSchema(schema.pipe[0]);
  }

  if ("wrapped" in schema && isConfigSchema(schema.wrapped)) {
    return getCoreConfigSchema(schema.wrapped);
  }

  if (isUnionConfigSchema(schema) && schema.options.length === 2) {
    const [flag, core] = schema.options;

    if (flag.type === "literal") {
      return getCoreConfigSchema(core);
    }
  }

  return schema;
}
