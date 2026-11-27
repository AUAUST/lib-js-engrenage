import { executableRoleName } from "#batiment/roles/constants";
import { createRolePreset } from "#batiment/roles/index";

/**
 * Preset of the role of `executable.ts` files; structure reads a program's
 * executable from it. Runs at the `effectful` level.
 */
export const executable = createRolePreset({
  name: executableRoleName,
  purpose: "A program's executable: it loads the program's root group and runs it.",
  file: ["executable.ts"],
  effects: "effectful",
});
