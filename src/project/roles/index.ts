export { createRolePreset, role } from "#batiment/roles/index";
export type {
  Role,
  RoleCompanionResolver,
  RoleModule,
  RolePreset,
} from "#batiment/roles/index";

// @barrel ports
export type * from "#project/roles/ports/RolePresetEntry";
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
