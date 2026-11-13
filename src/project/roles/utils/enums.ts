import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
/**
 * Preset of the `enums` role: each module exporting its file's name, at the
 * `pure` level.
 */
export const enums = createRolePreset({
  name: "enums",
  purpose: "Enumerations, one per module.",
  exports: "named-match",
  effects: "pure",
});
