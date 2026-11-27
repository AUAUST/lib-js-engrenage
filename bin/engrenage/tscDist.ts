import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  name: "tsc:dist",
  aliases: ["typecheck:dist"],
  description: "Check the types of the tests against the build output (the tests.dist tsconfig).",
  packageName: packages.typescript,
  binary: "tsc",
  message: "Checking the types of the build output...",
  action() {
    return import("#bin/engrenage/actions/tscDist");
  },
});
