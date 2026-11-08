import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  packageName: packages.vitest,
  message: "Running the tests with coverage...",
  configure(command) {
    return command.description("Run the tests once and report coverage.");
  },
  action() {
    return import("#bin/engrenage/actions/vitestCoverage");
  },
});
