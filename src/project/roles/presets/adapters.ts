import { createRolePreset } from "#project/roles/utils/createRolePreset";

/**
 * Preset of the `adapters` role: public modules, each exporting its file's name,
 * at the effectful level.
 */
export const adapters = createRolePreset({
  name: "adapters",
  purpose: "Implementations of other domains' ports, importable module by module.",
  exports: "named-match",
  effects: "effectful",
  public: true,
});
