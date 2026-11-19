import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  packageName: packages.eslint,
  message: "Suppressing lint errors...",
  root: true,
  configure(command) {
    return command.description("Suppress the remaining lint errors.");
  },
  action() {
    return import("#bin/engrenage/actions/eslintSuppress");
  },
});
