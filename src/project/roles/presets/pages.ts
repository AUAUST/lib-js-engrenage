import { createRolePreset } from "#batiment/roles/index";

/**
 * Preset of the `pages` role: discovered modules nested to any depth, with
 * one default export.
 */
export const pages = createRolePreset({
  name: "pages",
  purpose: "Routable pages, discovered by the router.",
  discovered: true,
  exports: "default",
  nesting: "any",
});
