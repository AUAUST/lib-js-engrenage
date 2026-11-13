import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
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
