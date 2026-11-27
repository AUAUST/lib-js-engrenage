import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  name: "prettier",
  aliases: ["format"],
  description: "Format the given files.",
  packageName: packages.prettier,
  action() {
    return import("#bin/engrenage/actions/prettier");
  },
});
