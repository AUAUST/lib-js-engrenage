import type { RoleRuleLoader } from "#tools/eslint/types/RoleRuleLoader";

/**
 * Rule loaders by role name, then by rule key, each rule registered as
 * `roles/<role>/<key>`.
 *
 * @experimental
 */
export type RoleRuleLoaders = Readonly<
  Record<string, Readonly<Record<string, RoleRuleLoader>>>
>;
