import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  packageName: packages.prettier,
  configure(command) {
    return command.description("Format the given files.");
  },
  action() {
    return import("#bin/engrenage/actions/prettier");
  },
});
