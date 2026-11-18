import { entryRoleName } from "#project/roles/constants";
import { createRolePreset } from "#project/roles/utils/createRolePreset";

/**
 * Preset of the role of `entry.ts` files, named `entrypoint`; structure reads a
 * domain's package entry from it.
 */
export const entrypoint = createRolePreset({
  name: entryRoleName,
  purpose: "The package entry of a public domain, re-exporting the public subset of its surface.",
  file: ["entry.ts"],
});
