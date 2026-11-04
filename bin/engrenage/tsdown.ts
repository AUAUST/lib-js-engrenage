import { packages } from "#constants";
import { defineToolCommands } from "#workflows/cli/operations/defineToolCommands";
import { ensureIncludes } from "#workflows/cli/operations/ensureIncludes";

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
