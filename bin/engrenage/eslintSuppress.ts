import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  name: "eslint:suppress",
  aliases: ["lint:suppress"],
  description: "Suppress the remaining lint errors.",
  packageName: packages.eslint,
  message: "Suppressing lint errors...",
  root: true,
  action() {
    return import("#bin/engrenage/actions/eslintSuppress");
  },
});
