import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  name: "vitest:watch",
  description: "Run the tests in watch mode, with type tests unless --no-typecheck.",
  packageName: packages.vitest,
  action() {
    return import("#bin/engrenage/actions/vitestWatch");
  },
});
