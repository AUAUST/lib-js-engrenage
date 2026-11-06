import type { InferInput } from "valibot";

import type { roleRulesSchema } from "#project/roles/config/schemas/roleRulesSchema";

export type RoleRules = InferInput<typeof roleRulesSchema>;
