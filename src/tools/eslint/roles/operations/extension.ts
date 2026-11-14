import { createRolePreset } from "#project/roles/index";

/**
 * Preset of the `extension` role: a domain's `extension.ts` default-exporting
 * its extension, collected across domains, with its imports checked by the
 * `extension-imports` rule.
 */
export const extension = createRolePreset({
  name: "extension",
  purpose: "The domain's extension: data and lazy loaders, read without loading the domain.",
  file: ["extension.ts"],
  unique: true,
  exports: "default",
  discovered: true,
  public: true,
  collected: true,
  effects: "effectful",
  rules: {
    "extension-imports": async () => {
      const {
        extensionImports,
      } = await import("#tools/eslint/rules/extensionImports");

      return extensionImports;
    },
  },
});
