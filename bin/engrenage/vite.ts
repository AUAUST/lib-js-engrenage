import { defineToolCommands } from "#cli/operations/defineToolCommands";
import { packages } from "#constants";

export const vite = defineToolCommands({
  packageName: packages.vite,
  commands: {
    vite: {
      description: "Run Vite.",
    },
  },
});
