import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
/**
 * Preset of the `errors` role: public modules, each exporting its file's name,
 * at the `pure` level.
 */
export const errors = createRolePreset({
  name: "errors",
  purpose: "Error classes, importable module by module.",
  exports: "named-match",
  effects: "pure",
  public: true,
});
