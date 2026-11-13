import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
/**
 * Preset of the `pages` role: discovered modules nested to any depth, with one
 * default export.
 */
export const pages = createRolePreset({
  name: "pages",
  purpose: "Routable pages, discovered by the router.",
  discovered: true,
  exports: "default",
  nesting: "any",
});
