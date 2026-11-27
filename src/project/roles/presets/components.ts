import { createRolePreset } from "#batiment/roles/index";

/**
 * Preset of the `components` role: `.tsx` and `.css` files, each module exporting
 * its file's name, active only where a structured role or namespace enables it,
 * evaluating at `confined` and invoking at `effectful`.
 */
export const components = createRolePreset({
  name: "components",
  purpose: "UI components with their styles.",
  accepts: ["*.tsx", "*.css"],
  exports: "named-match",
  effects: { evaluation: "confined", invocation: "effectful" },
  optIn: true,
});
