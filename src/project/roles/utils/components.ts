import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
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
