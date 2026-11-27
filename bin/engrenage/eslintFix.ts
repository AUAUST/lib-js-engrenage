import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  name: "eslint:fix",
  aliases: ["lint:fix"],
  description: "Fix lint errors and prune unused suppressions.",
  packageName: packages.eslint,
  message: "Fixing lint errors...",
  root: true,
  action() {
    return import("#bin/engrenage/actions/eslintFix");
  },
});
