import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  name: "jscpd",
  description: "Detect duplicated code in the project's code files, outside tests, fixtures and generated files.",
  packageName: packages.jscpd,
  message: "Detecting duplicated code...",
  action() {
    return import("#bin/engrenage/actions/jscpd");
  },
});
