import type { InferInput } from "valibot";

import type { roleRulesSchema } from "#batiment/roles/config/schemas/roleRulesSchema";

/**
 * Lint rules of a role, by key: a rule entry for a rule already registered.
 *
 * @experimental
 */
export type RoleRules = InferInput<typeof roleRulesSchema>;
