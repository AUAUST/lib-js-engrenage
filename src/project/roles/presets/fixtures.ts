import { createRolePreset } from "#project/roles/utils/createRolePreset";

/**
 * Preset of the `fixtures` role: nested to any depth, at the `pure` level.
 */
export const fixtures = createRolePreset({
  name: "fixtures",
  purpose: "Static test inputs.",
  nesting: "any",
  effects: "pure",
});
