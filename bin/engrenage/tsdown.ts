import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  name: "tsdown",
  description: "Build the package, loading the config with tsx.",
  packageName: packages.tsdown,
  action() {
    return import("#bin/engrenage/actions/tsdown");
  },
});
