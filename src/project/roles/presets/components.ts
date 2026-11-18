import { createRolePreset } from "#project/roles/utils/createRolePreset";

/**
 * Preset of the `components` role: `.tsx` and `.css` files, each module exporting
 * its file's name, active only where a structured role or namespace enables it.
 */
export const components = createRolePreset({
  name: "components",
  purpose: "UI components with their styles.",
  accepts: ["*.tsx", "*.css"],
  exports: "named-match",
  scoped: true,
});
