import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
export const entryRole = createRolePreset({
  name: "entry",
  purpose:
    "The package entry of a public domain, re-exporting the public subset of its surface.",
  file: ["entry.ts"],
});
