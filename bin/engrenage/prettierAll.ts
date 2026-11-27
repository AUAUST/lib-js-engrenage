import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  name: "prettier:all",
  aliases: ["format:all"],
  description: "Format the whole project.",
  packageName: packages.prettier,
  action() {
    return import("#bin/engrenage/actions/prettierAll");
  },
});
