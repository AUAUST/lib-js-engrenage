import { packages } from "#constants";
import { defineToolCommands } from "#workflows/cli/operations/defineToolCommands";

export const vite = defineToolCommands({
  packageName: packages.vite,
  commands: {
    vite: {
    },
  },
});
