import { record, string, union } from "valibot";

import { effectModuleResolverSchema } from "#project/structure/config/schemas/effectModuleResolverSchema";

export const effectModulesSchema = union([
  record(string(), string()),
  effectModuleResolverSchema,
]);
