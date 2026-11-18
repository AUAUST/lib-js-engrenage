import { indexRoleName } from "#project/roles/constants";
import { createRolePreset } from "#project/roles/utils/createRolePreset";

/**
 * Preset of the role of `index.ts` files; structure reads a domain's
 * surface from it.
 */
export const index = createRolePreset({
  name: indexRoleName,
  purpose: "The domain's public surface.",
  file: ["index.ts"],
});
