import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  packageName: packages.prettier,
  message: "Checking formatting...",
  configure(command) {
    return command.description("Check the formatting of the given files.");
  },
  action() {
    return import("#bin/engrenage/actions/prettierCheck");
  },
});
