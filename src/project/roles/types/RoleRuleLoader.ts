import type { RoleRuleModule } from "#project/roles/ports/RoleRuleModule";

/**
 * Loads a role rule module when lint builds the rules of the roles using it.
 *
 * @experimental
 */
export type RoleRuleLoader = () => Promise<RoleRuleModule>;
