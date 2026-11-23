// @barrel config/schemas
export { effectLevelsSchema } from "#batiment/roles/config/schemas/effectLevelsSchema";
export { effectModuleSchema } from "#batiment/roles/config/schemas/effectModuleSchema";
export { effectModulesSchema } from "#batiment/roles/config/schemas/effectModulesSchema";
export { effectsSchema } from "#batiment/roles/config/schemas/effectsSchema";
export { omitRolesSchema } from "#batiment/roles/config/schemas/omitRolesSchema";
export { reexportSchema } from "#batiment/roles/config/schemas/reexportSchema";
export { roleExportsSchema } from "#batiment/roles/config/schemas/roleExportsSchema";
export { roleGlobsSchema } from "#batiment/roles/config/schemas/roleGlobsSchema";
export { roleNameSchema } from "#batiment/roles/config/schemas/roleNameSchema";
export { roleRulesSchema } from "#batiment/roles/config/schemas/roleRulesSchema";
export { roleSchema } from "#batiment/roles/config/schemas/roleSchema";
export { rolesSchema } from "#batiment/roles/config/schemas/rolesSchema";
// @end

// @barrel config/declarers
export { declareRoleContractEntries } from "#batiment/roles/config/declarers/declareRoleContractEntries";
// @end

// @barrel types
export type * from "#batiment/roles/types/EffectModule";
export type * from "#batiment/roles/types/EffectModules";
export type * from "#batiment/roles/types/NamespaceRoles";
export type * from "#batiment/roles/types/ReexportMode";
export type * from "#batiment/roles/types/ResolvedEffects";
export type * from "#batiment/roles/types/ResolvedRoleContract";
export type * from "#batiment/roles/types/ResolvedRoleExports";
export type * from "#batiment/roles/types/ResolvedRoles";
export type * from "#batiment/roles/types/Role";
export type * from "#batiment/roles/types/RoleDefinition";
export type * from "#batiment/roles/types/RoleEffects";
export type * from "#batiment/roles/types/RoleInput";
export type * from "#batiment/roles/types/RoleLocation";
export type * from "#batiment/roles/types/RoleLocationMember";
export type * from "#batiment/roles/types/RolePreset";
export type * from "#batiment/roles/types/RoleRegistry";
export type * from "#batiment/roles/types/RoleRules";
// @end

// @barrel utils
export { completeRole } from "#batiment/roles/utils/completeRole";
export { createRolePreset } from "#batiment/roles/utils/createRolePreset";
export { fillRolePlaceholders } from "#batiment/roles/utils/fillRolePlaceholders";
export { getEntryFile } from "#batiment/roles/utils/getEntryFile";
export { getExecutableFile } from "#batiment/roles/utils/getExecutableFile";
export { getIndexFile } from "#batiment/roles/utils/getIndexFile";
export { isLocatedRoleFile } from "#batiment/roles/utils/isLocatedRoleFile";
export { listDiscoveredGlobs } from "#batiment/roles/utils/listDiscoveredGlobs";
export { listNamespaceRoles } from "#batiment/roles/utils/listNamespaceRoles";
export { listReexportModes } from "#batiment/roles/utils/listReexportModes";
export { listRolePlaceholders } from "#batiment/roles/utils/listRolePlaceholders";
export { listStaticFileGlobs } from "#batiment/roles/utils/listStaticFileGlobs";
export { rankModule } from "#batiment/roles/utils/rankModule";
export { registerRoles } from "#batiment/roles/utils/registerRoles";
export { resolveRoles } from "#batiment/roles/utils/resolveRoles";
export { role } from "#batiment/roles/utils/role";
// @end
