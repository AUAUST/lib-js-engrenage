import { defaultCacheLocation } from "#eslint/constants";
import { defineToolCommands } from "#support/commander/utils/defineToolCommands";
import { ensureIncludes } from "#support/commander/utils/ensureIncludes";

export default defineToolCommands({
  packageName: "eslint",
  commands: {
    eslint: {
      description: "Lint the project, caching results in node_modules.",
      aliases: "lint",
      arguments(config, args) {
        ensureIncludes(args, "--cache");

        ensureIncludes(args, [
          "--cache-location",
          config.resolve(defaultCacheLocation),
        ]);
      },
    },
  },
});
