import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
export const utils = createRolePreset({
  name: "utils",
  purpose: "Confined functions, one per module.",
  exports: { values: "named-match", types: "named" },
  effects: "confined",
});
