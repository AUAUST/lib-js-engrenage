import { createRolePreset } from "#project/roles/utils/createRolePreset";

/**
 * Preset of the `styles` role: `.css` files.
 */
export const styles = createRolePreset({
  name: "styles",
  purpose: "Stylesheets.",
  accepts: ["*.css"],
});
