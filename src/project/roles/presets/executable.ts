import { executableRoleName } from "#project/roles/constants";
import { createRolePreset } from "#project/roles/utils/createRolePreset";

/**
 * Preset of the role of `executable.ts` files; structure reads a program's
 * executable from it.
 */
export const executable = createRolePreset({
  name: executableRoleName,
  purpose: "A program's executable: it loads the program's root group and runs it.",
  file: ["executable.ts"],
});
