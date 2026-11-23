import type { RoleRule } from "#tools/eslint/ports/RoleRule";

/**
 * Loads a role rule when lint builds the rules of the role it is keyed by.
 *
 * @experimental
 */
export type RoleRuleLoader = () => Promise<RoleRule>;
