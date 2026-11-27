import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  name: "vitest:coverage",
  description: "Run the tests once and report coverage.",
  packageName: packages.vitest,
  message: "Running the tests with coverage...",
  action() {
    return import("#bin/engrenage/actions/vitestCoverage");
  },
});
