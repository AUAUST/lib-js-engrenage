import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  name: "eslint",
  aliases: ["lint"],
  description: "Lint the project.",
  packageName: packages.eslint,
  message: "Linting...",
  action() {
    return import("#bin/engrenage/actions/eslint");
  },
});
