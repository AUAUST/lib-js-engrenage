import { tsdown } from "#constants";
import { defineToolCommands } from "#support/commander/utils/defineToolCommands";
import { ensureIncludes } from "#support/commander/utils/ensureIncludes";

export default defineToolCommands({
  packageName: tsdown,
  commands: {
    tsdown: {
      description: "Build the package, loading the config with tsx.",
      arguments(config, args) {
        ensureIncludes(args, ["--config-loader", "tsx"]);
      },
    },
  },
});
