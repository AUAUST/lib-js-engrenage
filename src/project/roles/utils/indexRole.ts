import { indexRoleName } from "#project/roles/constants";
import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt named `indexRole` only because the `utils` role cannot hold a module named `index.ts`: a role holding a list of modules should accept one named like another role (`index.ts` or any other), maybe through a flag; to review
// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
export const indexRole = createRolePreset({
  name: indexRoleName,
  purpose: "The domain's public surface.",
  file: ["index.ts"],
});
