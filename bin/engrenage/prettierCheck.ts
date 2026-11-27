import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  name: "prettier:check",
  description: "Check the formatting of the given files.",
  packageName: packages.prettier,
  message: "Checking formatting...",
  action() {
    return import("#bin/engrenage/actions/prettierCheck");
  },
});
