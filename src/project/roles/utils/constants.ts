import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
/**
 * Preset of the `constants` role: a public `constants.ts` file at the `pure`
 * level, also a package subpath.
 */
export const constants = createRolePreset({
  name: "constants",
  purpose: "Deeply read-only constants of the domain.",
  file: ["constants.ts"],
  effects: "pure",
  public: true,
  subpath: true,
});
