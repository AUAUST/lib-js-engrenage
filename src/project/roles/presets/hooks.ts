import { createRolePreset } from "#batiment/roles/index";

/**
 * Preset of the `hooks` role: each module exporting its file's name, active only
 * where a structured role or namespace enables it, evaluating at `confined` and
 * invoking at `effectful`.
 */
export const hooks = createRolePreset({
  name: "hooks",
  purpose: "Reusable stateful logic of components.",
  exports: "named-match",
  effects: { evaluation: "confined", invocation: "effectful" },
  optIn: true,
});
