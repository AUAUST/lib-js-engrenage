import { vite } from "#constants";
import { defineToolCommands } from "#support/commander/utils/defineToolCommands";

export default defineToolCommands({
  packageName: vite,
  commands: {
    vite: {
      description: "Run Vite.",
    },
  },
});
