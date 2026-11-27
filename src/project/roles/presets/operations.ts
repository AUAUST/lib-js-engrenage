import { createRolePreset } from "#batiment/roles/index";

/**
 * Preset of the `operations` role: modules each exporting its file's name, at
 * the `effectful` level.
 */
export const operations = createRolePreset({
  name: "operations",
  purpose: "Effectful logic of the domain.",
  exports: "named-match",
  effects: { evaluation: "confined", invocation: "effectful" },
});
