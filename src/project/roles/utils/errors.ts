import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
export const errors = createRolePreset({
  name: "errors",
  purpose: "Error classes, importable module by module.",
  exports: "named-match",
  effects: "pure",
  public: true,
});
