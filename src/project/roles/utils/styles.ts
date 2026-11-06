import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
export const styles = createRolePreset({
  name: "styles",
  purpose: "Stylesheets.",
  accepts: ["*.css"],
});
