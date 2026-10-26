import { defineToolCommands } from "#support/commander/utils/defineToolCommands";

export default defineToolCommands({
  packageName: "tsdown",
  commands: {
    tsdown: {
      description: "Build the package.",
      arguments() {
        return [];
      },
    },
  },
});
