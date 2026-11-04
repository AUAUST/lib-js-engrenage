import { defineToolCommands } from "#cli/utils/defineToolCommands";
import { ensureIncludes } from "#cli/utils/ensureIncludes";
import { packages } from "#constants";

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
