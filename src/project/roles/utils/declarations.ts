import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
/**
 * Preset of the `declarations` role: any `.d.ts` file.
 */
export const declarations = createRolePreset({
  name: "declarations",
  purpose: "Ambient type declarations.",
  file: ["*.d.ts"],
});
