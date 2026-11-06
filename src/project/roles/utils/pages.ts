import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
export const pages = createRolePreset({
  name: "pages",
  purpose: "Routable pages, discovered by the router.",
  discovered: true,
  exports: "default",
  nesting: "any",
});
