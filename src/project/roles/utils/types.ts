import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
export const types = createRolePreset({
  name: "types",
  purpose: "Types only, one per module.",
  exports: { values: "none", types: "named-match" },
  typeOnly: true,
});
