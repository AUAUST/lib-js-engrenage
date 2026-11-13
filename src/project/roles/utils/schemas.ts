import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
// @debt pure by default, yet schemas built with the `foundation/options` declarers import confined utils, so a project using them overrides it as confined
/**
 * Preset of the `schemas` role: each module exporting its file's name, at the
 * `pure` level.
 */
export const schemas = createRolePreset({
  name: "schemas",
  purpose: "Validation schemas of options.",
  exports: "named-match",
  effects: "pure",
});
