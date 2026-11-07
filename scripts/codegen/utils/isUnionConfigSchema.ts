import type { ConfigSchema } from "#scripts/codegen/types/ConfigSchema";
import type { UnionConfigSchema } from "#scripts/codegen/types/UnionConfigSchema";

export function isUnionConfigSchema(
  schema: ConfigSchema,
): schema is ConfigSchema & UnionConfigSchema {
  return schema.type === "union";
}
