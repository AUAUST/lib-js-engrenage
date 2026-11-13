import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
/**
 * Preset of the `types` role: type-only modules, each exporting its file's name
 * as a type and no value.
 */
export const types = createRolePreset({
  name: "types",
  purpose: "Types only, one per module.",
  exports: { values: "none", types: "named-match" },
  typeOnly: true,
});
