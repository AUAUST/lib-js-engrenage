import { executableRoleName } from "#project/roles/constants";
import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
export const executable = createRolePreset({
  name: executableRoleName,
  purpose:
    "A program's executable: it loads the program's root group and runs it.",
  file: ["executable.ts"],
});
