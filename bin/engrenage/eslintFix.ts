import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  packageName: packages.eslint,
  message: "Fixing lint errors...",
  configure(command) {
    return command.description(
      "Fix lint errors and prune unused suppressions.",
    );
  },
  action() {
    return import("#bin/engrenage/actions/eslintFix");
  },
});
