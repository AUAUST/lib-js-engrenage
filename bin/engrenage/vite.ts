import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  packageName: packages.vite,
  configure(command) {
    return command.description("Run Vite.");
  },
  action() {
    return import("#bin/engrenage/actions/vite");
  },
});
