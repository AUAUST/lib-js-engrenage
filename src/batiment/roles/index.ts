// @barrel config/schemas
export { omitRolesSchema } from "#batiment/roles/config/schemas/omitRolesSchema";
export { reexportSchema } from "#batiment/roles/config/schemas/reexportSchema";
export { roleCompanionResolverSchema } from "#batiment/roles/config/schemas/roleCompanionResolverSchema";
export { roleExportsSchema } from "#batiment/roles/config/schemas/roleExportsSchema";
export { roleFileResolverSchema } from "#batiment/roles/config/schemas/roleFileResolverSchema";
export { roleNameSchema } from "#batiment/roles/config/schemas/roleNameSchema";
export { roleRulesSchema } from "#batiment/roles/config/schemas/roleRulesSchema";
export { roleSchema } from "#batiment/roles/config/schemas/roleSchema";
export { rolesSchema } from "#batiment/roles/config/schemas/rolesSchema";
// @end

// @barrel config/declarers
export { declareRoleContractEntries } from "#batiment/roles/config/declarers/declareRoleContractEntries";
// @end

// @barrel types
export type * from "#batiment/roles/types/ReexportMode";
export type * from "#batiment/roles/types/Role";
export type * from "#batiment/roles/types/RoleCompanionResolver";
export type * from "#batiment/roles/types/RoleFileResolver";
export type * from "#batiment/roles/types/RoleInput";
export type * from "#batiment/roles/types/RoleLocation";
export type * from "#batiment/roles/types/RoleLocationMember";
export type * from "#batiment/roles/types/RoleModule";
export type * from "#batiment/roles/types/RolePreset";
export type * from "#batiment/roles/types/RoleRuleLoader";
export type * from "#batiment/roles/types/RoleRules";
// @end

// @barrel utils
export { createRolePreset } from "#batiment/roles/utils/createRolePreset";
export { role } from "#batiment/roles/utils/role";
// @end

// @barrel ports
export type * from "#batiment/roles/ports/RoleRuleModule";
// @end
