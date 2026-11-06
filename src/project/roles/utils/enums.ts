import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
export const enums = createRolePreset({
  name: "enums",
  purpose: "Enumerations, one per module.",
  exports: "named-match",
  effects: "pure",
});
