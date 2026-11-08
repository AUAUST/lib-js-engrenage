import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  packageName: packages.tsdown,
  configure(command) {
    return command.description(
      "Build the package, loading the config with tsx.",
    );
  },
  action() {
    return import("#bin/engrenage/actions/tsdown");
  },
});
