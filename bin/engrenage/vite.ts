import { packages } from "#constants";
import { defineToolCommands } from "#support/commander/utils/defineToolCommands";

export const vite = defineToolCommands({
  packageName: packages.vite,
  commands: {
    vite: {
      description: "Run Vite.",
    },
  },
});
