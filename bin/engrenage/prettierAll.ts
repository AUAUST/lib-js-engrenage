import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  packageName: packages.prettier,
  configure(command) {
    return command.description("Format the whole project.");
  },
  action() {
    return import("#bin/engrenage/actions/prettierAll");
  },
});
