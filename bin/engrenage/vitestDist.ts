import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  name: "vitest:dist",
  description: "Run the tests once against the built output.",
  packageName: packages.vitest,
  message: "Running the tests against the build output...",
  action() {
    return import("#bin/engrenage/actions/vitestDist");
  },
});
