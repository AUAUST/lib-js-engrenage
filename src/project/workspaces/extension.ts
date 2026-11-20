import type { Extension } from "#project/config/index";

/**
 * Owns the `workspaces` and `scopes` config keys.
 */
export default {
  name: "project/workspaces",
  owns: {
    keys: {
      workspaces: {
        input: "workspaces",
        async load() {
          const {
            workspacesSection,
          } = await import("#project/workspaces/config/sections/workspacesSection");

          return workspacesSection;
        },
      },
      scopes: {
        async load() {
          const {
            scopesSection,
          } = await import("#project/workspaces/config/sections/scopesSection");

          return scopesSection;
        },
      },
    },
  },
} satisfies Extension;
