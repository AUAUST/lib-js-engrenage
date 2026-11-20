import { createRolePreset } from "#batiment/roles/index";

/**
 * Preset of the `enums` role: each module exporting its file's name, at
 * the `pure` level.
 */
export const enums = createRolePreset({
  name: "enums",
  purpose: "Enumerations, one per module.",
  exports: "named-match",
  effects: "pure",
});
