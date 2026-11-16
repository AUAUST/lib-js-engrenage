import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
/**
 * Preset of the `operations` role: modules each exporting its file's name, at
 * the `effectful` level.
 */
export const operations = createRolePreset({
  name: "operations",
  purpose: "Effectful logic of the domain.",
  exports: "named-match",
  effects: "effectful",
});
