import type { Extension } from "#project/config/index";

/**
 * Owns the `workspaces` config key.
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
    },
  },
} satisfies Extension;
