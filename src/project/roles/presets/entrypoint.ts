import { entryRoleName } from "#batiment/roles/constants";
import { createRolePreset } from "#batiment/roles/index";

/**
 * Preset of the role of `entry.ts` files, named `entrypoint`; structure reads
 * a domain's package entry from it. Its `confined` evaluation ceiling is what
 * importing through it costs.
 */
export const entrypoint = createRolePreset({
  name: entryRoleName,
  purpose: "The package entry of a public domain, re-exporting the public subset of its surface.",
  file: ["entry.ts"],
  effects: { evaluation: "confined" },
});
