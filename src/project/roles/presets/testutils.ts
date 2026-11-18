import { createRolePreset } from "#project/roles/utils/createRolePreset";

/**
 * Preset of the `testutils` role, also read from `utils` directories: each module
 * exporting its file's name, at the `effectful` level.
 */
export const testutils = createRolePreset({
  name: "testutils",
  aliases: ["utils"],
  purpose: "Reusable test utilities.",
  exports: "named-match",
  // @debt make it observing once the type is added, and add mocks/other roles for genuinely impactful utils; a test utility may read the environment's mocks or context, but it must not produce side effects that'd fail in non-isolated tests.
  effects: "effectful",
});
