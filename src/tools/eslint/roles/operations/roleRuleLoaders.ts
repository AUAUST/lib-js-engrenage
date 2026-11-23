import type { RoleRuleLoaders } from "#tools/eslint/types/RoleRuleLoaders";

// @debt keyed by the presets' default names, so a preset renamed through its `name` option loses its rules
/**
 * The rule loaders of the role presets this domain provides, by role name.
 */
export const roleRuleLoaders = {
  apis: {
    "api-interface": async () => {
      const { apiInterface } = await import("#tools/eslint/rules/apiInterface");

      return apiInterface;
    },
  },
  extension: {
    "extension-imports": async () => {
      const {
        extensionImports,
      } = await import("#tools/eslint/rules/extensionImports");

      return extensionImports;
    },
  },
} satisfies RoleRuleLoaders;
