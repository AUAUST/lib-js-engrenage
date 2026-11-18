import { createRolePreset } from "#project/roles/utils/createRolePreset";

/**
 * Preset of the `utils` role: each module exporting its file's name as a value
 * and any types, at the `confined` level.
 */
export const utils = createRolePreset({
  name: "utils",
  purpose: "Confined functions, one per module.",
  exports: { values: "named-match", types: "named" },
  effects: "confined",
});
