import type { RoleRuleModule } from "#project/roles/ports/RoleRuleModule";

export type RoleRuleLoader = () => Promise<RoleRuleModule>;
