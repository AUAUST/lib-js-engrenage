import { entryRoleName } from "#project/roles/constants";
import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
export const entrypoint = createRolePreset({
  name: entryRoleName,
  purpose: "The package entry of a public domain, re-exporting the public subset of its surface.",
  file: ["entry.ts"],
});
