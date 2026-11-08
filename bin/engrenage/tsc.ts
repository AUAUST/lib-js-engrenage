import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  packageName: packages.typescript,
  binary: "tsc",
  message: "Typechecking...",
  configure(command) {
    return command.description(
      "Check types of every environment the base tsconfig references (those with `check: true`).",
    );
  },
  action() {
    return import("#bin/engrenage/actions/tsc");
  },
});
