import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  packageName: packages.vitest,
  message: "Running the tests...",
  configure(command) {
    return command.description(
      "Run the tests once, with type tests unless --no-typecheck.",
    );
  },
  action() {
    return import("#bin/engrenage/actions/vitest");
  },
});
