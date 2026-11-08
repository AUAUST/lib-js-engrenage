import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  packageName: packages.jscpd,
  message: "Detecting duplicated code...",
  configure(command) {
    return command.description(
      "Detect duplicated code in the project's code files, outside tests, fixtures and generated files.",
    );
  },
  action() {
    return import("#bin/engrenage/actions/jscpd");
  },
});
