import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
// @debt the only preset without an effect level, so every project overrides it to rank it; should likely be observing rather than effectful
export const adapters = createRolePreset({
  name: "adapters",
  purpose: "Implementations of other domains' ports, importable module by module.",
  exports: "named-match",
  public: true,
});
