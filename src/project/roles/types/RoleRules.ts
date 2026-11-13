import type { InferInput } from "valibot";

import type { roleRulesSchema } from "#project/roles/config/schemas/roleRulesSchema";

/**
 * Lint rules of a role, by key: a rule entry for a rule already registered, or a
 * role rule module or its loader, registered as `roles/<role>/<key>` and reported
 * as errors.
 *
 * @experimental
 */
export type RoleRules = InferInput<typeof roleRulesSchema>;
