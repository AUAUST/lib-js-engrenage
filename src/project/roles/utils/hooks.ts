import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
export const hooks = createRolePreset({
  name: "hooks",
  purpose: "Reusable stateful logic of components.",
  exports: "named-match",
  scoped: true,
});
