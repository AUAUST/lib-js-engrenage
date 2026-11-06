import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
export const contexts = createRolePreset({
  name: "contexts",
  purpose: "Shared state providers.",
  exports: "named-match",
  scoped: true,
});
