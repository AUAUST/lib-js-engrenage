import { createRolePreset } from "#batiment/roles/index";

/**
 * Preset of the `hooks` role: each module exporting its file's name, active only
 * where a structured role or namespace enables it.
 */
export const hooks = createRolePreset({
  name: "hooks",
  purpose: "Reusable stateful logic of components.",
  exports: "named-match",
  optIn: true,
});
