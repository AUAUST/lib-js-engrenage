import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  packageName: packages.typescript,
  binary: "tsc",
  message: "Checking the types of the build output...",
  configure(command) {
    return command.description(
      "Check the types of the tests against the build output (the tests.dist tsconfig).",
    );
  },
  action() {
    return import("#bin/engrenage/actions/tscDist");
  },
});
