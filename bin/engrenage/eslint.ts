import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  packageName: packages.eslint,
  message: "Linting...",
  configure(command) {
    return command.description("Lint the project.");
  },
});
