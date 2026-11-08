import type { RoleRuleModule } from "#project/roles/types/RoleRuleModule";

export type RoleRuleLoader = () => Promise<RoleRuleModule>;
