import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  packageName: packages.vite,
  configure(command) {
    return command.description("Run Vite.");
  },
});
