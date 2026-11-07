import { record, string, union } from "valibot";

import { effectModuleResolverSchema } from "#project/structure/config/schemas/effectModuleResolverSchema";
import { effectModuleSchema } from "#project/structure/config/schemas/effectModuleSchema";

export const effectModulesSchema = union([
  record(string(), effectModuleSchema),
  effectModuleResolverSchema,
]);
