import { createRolePreset } from "#project/roles/utils/createRolePreset";

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
