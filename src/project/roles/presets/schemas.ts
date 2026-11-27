import { createRolePreset } from "#batiment/roles/index";

/**
 * Preset of the `schemas` role: each module exporting its file's name, at
 * the `confined` level.
 */
export const schemas = createRolePreset({
  name: "schemas",
  purpose: "Validation schemas of options.",
  exports: "named-match",
  effects: "confined",
});
