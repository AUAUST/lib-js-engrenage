import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  name: "vitest",
  description: "Run the tests once, with type tests unless --no-typecheck.",
  packageName: packages.vitest,
  message: "Running the tests...",
  action() {
    return import("#bin/engrenage/actions/vitest");
  },
});
