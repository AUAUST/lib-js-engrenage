import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
export const testsetup = createRolePreset({
  name: "testsetup",
  purpose: "Test runner setup file.",
  file: ["setup.ts"],
  discovered: true,
});
