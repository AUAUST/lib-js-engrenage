import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
/**
 * Preset of the `ports` role: public type-only modules, each exporting its file's
 * name, at the `pure` level.
 */
export const ports = createRolePreset({
  name: "ports",
  purpose: "Interfaces other domains implement, definers' included, importable module by module.",
  exports: "named-match",
  public: true,
  typeOnly: true,
  effects: "pure",
});
