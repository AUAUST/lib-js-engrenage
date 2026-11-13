import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
/**
 * Preset of the `contexts` role: each module exporting its file's name, active
 * only where a structured role or namespace enables it.
 */
export const contexts = createRolePreset({
  name: "contexts",
  purpose: "Shared state providers.",
  exports: "named-match",
  scoped: true,
});
