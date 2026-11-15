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
        load() {
          return import("#project/workspaces/config/sections/workspacesSection");
        },
      },
    },
  },
} satisfies Extension;
