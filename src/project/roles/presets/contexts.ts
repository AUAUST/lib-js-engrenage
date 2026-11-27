import { createRolePreset } from "#batiment/roles/index";

/**
 * Preset of the `contexts` role: each module exporting its file's name, active
 * only where a structured role or namespace enables it, evaluating at `confined`
 * and invoking at `effectful`.
 */
export const contexts = createRolePreset({
  name: "contexts",
  purpose: "Shared state providers.",
  exports: "named-match",
  effects: { evaluation: "confined", invocation: "effectful" },
  optIn: true,
});
