import { createRolePreset } from "#batiment/roles/index";

/**
 * Preset of the `testsetup` role: a discovered `setup.ts` file.
 */
export const testsetup = createRolePreset({
  name: "testsetup",
  purpose: "Test runner setup file.",
  file: ["setup.ts"],
  discovered: true,
});
