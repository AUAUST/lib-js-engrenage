// @barrel config/schemas
export { reexportSchema } from "#project/roles/config/schemas/reexportSchema";
export { roleCompanionResolverSchema } from "#project/roles/config/schemas/roleCompanionResolverSchema";
export { roleExportsSchema } from "#project/roles/config/schemas/roleExportsSchema";
export { roleFileResolverSchema } from "#project/roles/config/schemas/roleFileResolverSchema";
export { roleNameSchema } from "#project/roles/config/schemas/roleNameSchema";
export { roleRulesSchema } from "#project/roles/config/schemas/roleRulesSchema";
export { roleSchema } from "#project/roles/config/schemas/roleSchema";
export { rolesSchema } from "#project/roles/config/schemas/rolesSchema";
// @end

// @barrel config/declarers
export { declareRoleContractEntries } from "#project/roles/config/declarers/declareRoleContractEntries";
// @end

// @barrel types
export type * from "#project/roles/types/ReexportMode";
export type * from "#project/roles/types/Role";
export type * from "#project/roles/types/RoleCompanionResolver";
export type * from "#project/roles/types/RoleFileResolver";
export type * from "#project/roles/types/RoleInput";
export type * from "#project/roles/types/RoleLocation";
export type * from "#project/roles/types/RoleLocationMember";
export type * from "#project/roles/types/RoleModule";
export type * from "#project/roles/types/RolePreset";
export type * from "#project/roles/types/RoleRuleLoader";
export type * from "#project/roles/types/RoleRules";
// @end

// @barrel ports
export type * from "#project/roles/ports/RolePresetEntry";
export type * from "#project/roles/ports/RoleRuleModule";
// @end

// @barrel utils
export { createRolePreset } from "#project/roles/utils/createRolePreset";
export { role } from "#project/roles/utils/role";
// @end

// @barrel presets
export { actions } from "#project/roles/presets/actions";
export { adapters } from "#project/roles/presets/adapters";
export { commands } from "#project/roles/presets/commands";
export { components } from "#project/roles/presets/components";
export { constants } from "#project/roles/presets/constants";
export { contexts } from "#project/roles/presets/contexts";
export { declarations } from "#project/roles/presets/declarations";
export { entrypoint } from "#project/roles/presets/entrypoint";
export { enums } from "#project/roles/presets/enums";
export { errors } from "#project/roles/presets/errors";
export { executable } from "#project/roles/presets/executable";
export { fixtures } from "#project/roles/presets/fixtures";
export { hooks } from "#project/roles/presets/hooks";
export { index } from "#project/roles/presets/index";
export { operations } from "#project/roles/presets/operations";
export { pages } from "#project/roles/presets/pages";
export { ports } from "#project/roles/presets/ports";
export { schemas } from "#project/roles/presets/schemas";
export { styles } from "#project/roles/presets/styles";
export { testsetup } from "#project/roles/presets/testsetup";
export { testutils } from "#project/roles/presets/testutils";
export { types } from "#project/roles/presets/types";
export { utils } from "#project/roles/presets/utils";
// @end
