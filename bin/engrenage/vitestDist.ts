import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  packageName: packages.vitest,
  message: "Running the tests against the build output...",
  configure(command) {
    return command.description("Run the tests once against the built output.");
  },
  action() {
    return import("#bin/engrenage/actions/vitestDist");
  },
});
