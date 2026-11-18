import { createRolePreset } from "#project/roles/utils/createRolePreset";

/**
 * Preset of the `declarations` role: any `.d.ts` file.
 */
export const declarations = createRolePreset({
  name: "declarations",
  purpose: "Ambient type declarations.",
  file: ["*.d.ts"],
});
