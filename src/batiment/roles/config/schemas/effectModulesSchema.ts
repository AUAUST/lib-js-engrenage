import { record, string } from "valibot";

import { effectModuleSchema } from "#batiment/roles/config/schemas/effectModuleSchema";

export const effectModulesSchema = record(string(), effectModuleSchema);
