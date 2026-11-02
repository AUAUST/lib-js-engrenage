import { packages } from "#constants";
import { defineToolCommands } from "#support/commander/utils/defineToolCommands";
import { ensureIncludes } from "#support/commander/utils/ensureIncludes";

export const tsdown = defineToolCommands({
  packageName: packages.tsdown,
  commands: {
    tsdown: {
      description: "Build the package, loading the config with tsx.",
      arguments(config, args) {
        ensureIncludes(args, ["--config-loader", "tsx"]);
      },
    },
  },
});
