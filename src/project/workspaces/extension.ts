import type { Extension } from "#project/config/index";

/**
 * Owns the `name`, `workspaces`, `workspaces.options`, `scopes` and
 * `scopes.discovery` config keys.
 */
export default {
  name: "project/workspaces",
  owns: {
    keys: {
      "name": {
        input: "name",
        async load() {
          const {
            nameSection,
          } = await import("#project/workspaces/config/sections/nameSection");

          return nameSection;
        },
      },
      "workspaces": {
        scope: "project",
        async load() {
          const {
            workspacesSection,
          } = await import("#project/workspaces/config/sections/workspacesSection");

          return workspacesSection;
        },
      },
      "workspaces.options": {
        scope: "project",
        input: "workspaces",
        async load() {
          const {
            workspacesOptionsSection,
          } = await import("#project/workspaces/config/sections/workspacesOptionsSection");

          return workspacesOptionsSection;
        },
      },
      "scopes": {
        scope: "project",
        async load() {
          const {
            scopesSection,
          } = await import("#project/workspaces/config/sections/scopesSection");

          return scopesSection;
        },
      },
      "scopes.discovery": {
        scope: "project",
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
