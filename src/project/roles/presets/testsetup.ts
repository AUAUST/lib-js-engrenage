import { createRolePreset } from "#batiment/roles/index";

/**
 * Preset of the `testsetup` role: a discovered `setup.ts` file, at the
 * `effectful` level.
 */
export const testsetup = createRolePreset({
  name: "testsetup",
  purpose: "Test runner setup file.",
  file: ["setup.ts"],
  discovered: true,
  effects: "effectful",
});
