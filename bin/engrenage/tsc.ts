import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  name: "tsc",
  aliases: ["typecheck"],
  description: "Check types of every environment the base tsconfig references (those with `check: true`).",
  packageName: packages.typescript,
  binary: "tsc",
  message: "Typechecking...",
  action() {
    return import("#bin/engrenage/actions/tsc");
  },
});
