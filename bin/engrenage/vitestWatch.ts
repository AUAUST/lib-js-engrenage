import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  packageName: packages.vitest,
  configure(command) {
    return command.description(
      "Run the tests in watch mode, with type tests unless --no-typecheck.",
    );
  },
  action() {
    return import("#bin/engrenage/actions/vitestWatch");
  },
});
