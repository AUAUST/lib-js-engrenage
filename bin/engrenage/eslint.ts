import { defaultCacheLocation } from "#eslint/constants";
import { defineToolCommands } from "#support/commander/utils/defineToolCommands";

export default defineToolCommands({
  packageName: "eslint",
  commands: {
    eslint: {
      description: "Lint the project, caching results in node_modules.",
      arguments(config) {
        return [
          "--cache",
          "--cache-location",
          config.resolve(defaultCacheLocation),
        ];
      },
    },
  },
});
