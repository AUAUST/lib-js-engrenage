import { createRolePreset } from "#project/roles/index";

export const extension = createRolePreset({
  name: "extension",
  purpose: "The domain's extension: data and lazy loaders, read without loading the domain.",
  file: ["extension.ts"],
  unique: true,
  exports: "default",
  discovered: true,
  public: true,
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
