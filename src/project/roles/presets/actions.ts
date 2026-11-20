import { createRolePreset } from "#batiment/roles/index";

/**
 * Preset of the `actions` role: one default export per module, at the
 * `effectful` level.
 */
export const actions = createRolePreset({
  name: "actions",
  purpose: "The behavior of one command, without its name, aliases or argument structure, loaded when it runs.",
  exports: "default",
  effects: "effectful",
});
