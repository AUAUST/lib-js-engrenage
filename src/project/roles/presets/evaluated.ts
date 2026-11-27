import { createRolePreset } from "#batiment/roles/index";

/**
 * Preset of the `evaluated` role: a `*.config.ts` file whose evaluation is its
 * behavior, at the `effectful` level.
 */
export const evaluated = createRolePreset({
  name: "evaluated",
  purpose: "A module whose evaluation is its behavior.",
  file: ["*.config.ts"],
  effects: "effectful",
});
