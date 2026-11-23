import type { Extension } from "#project/config/index";

/**
 * Owns the `workspaces`, `workspaces.options`, `scopes` and `scopes.discovery`
 * config keys.
 */
export default {
  name: "project/workspaces",
  owns: {
    keys: {
      "workspaces": {
        async load() {
          const {
            workspacesSection,
          } = await import("#project/workspaces/config/sections/workspacesSection");

          return workspacesSection;
        },
      },
      "workspaces.options": {
        input: "workspaces",
        async load() {
          const {
            workspacesOptionsSection,
          } = await import("#project/workspaces/config/sections/workspacesOptionsSection");

          return workspacesOptionsSection;
        },
      },
      "scopes": {
        async load() {
          const {
            scopesSection,
          } = await import("#project/workspaces/config/sections/scopesSection");

          return scopesSection;
        },
      },
      "scopes.discovery": {
        async load() {
          const {
            discoverySection,
          } = await import("#project/workspaces/config/sections/discoverySection");

          return discoverySection;
        },
      },
    },
  },
} satisfies Extension;
