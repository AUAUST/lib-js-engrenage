import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
/**
 * Preset of the `actions` role: one default export per module, at the `effectful`
 * level.
 */
export const actions = createRolePreset({
  name: "actions",
  purpose: "The behavior of one command, without its name, aliases or argument structure, loaded when it runs.",
  exports: "default",
  effects: "effectful",
});
