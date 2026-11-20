import { record, string, union } from "valibot";

import { effectModuleResolverSchema } from "#batiment/roles/config/schemas/effectModuleResolverSchema";
import { effectModuleSchema } from "#batiment/roles/config/schemas/effectModuleSchema";

export const effectModulesSchema = union([
  record(string(), effectModuleSchema),
  effectModuleResolverSchema,
]);
