import { createRolePreset } from "#batiment/roles/index";

/**
 * Preset of the `styles` role: `.css` files.
 */
export const styles = createRolePreset({
  name: "styles",
  purpose: "Stylesheets.",
  accepts: ["*.css"],
});
