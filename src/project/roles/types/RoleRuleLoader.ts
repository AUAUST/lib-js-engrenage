import type { RoleRuleModule } from "#project/roles/ports/RoleRuleModule";

/** @experimental */
export type RoleRuleLoader = () => Promise<RoleRuleModule>;
