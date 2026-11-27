import { indexRoleName } from "#batiment/roles/constants";
import { createRolePreset } from "#batiment/roles/index";

/**
 * Preset of the role of `index.ts` files; structure reads a domain's surface
 * from it. Its `pure` evaluation ceiling is what importing through it costs.
 */
export const index = createRolePreset({
  name: indexRoleName,
  purpose: "The domain's public surface.",
  file: ["index.ts"],
  effects: { evaluation: "pure" },
});
