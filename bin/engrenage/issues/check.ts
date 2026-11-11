import { Option } from "@commander-js/extra-typings";

import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Check that an issue meets the issue contract, reporting its sub-issues and blocking issues as open, closed by a local `Closes` commit or closed on GitHub, and the local commits `Towards` it; exit 1 with one line per finding otherwise.",
      )
      .argument("<number>", "issue number", Number)
      .option(
        "--repo <repo>",
        "repository as `owner/repo` or a registered short name, else package.json or origin",
      )
      .addOption(
        new Option("--for <role>", "who the issue is checked for")
          .choices(["worker", "debugger"] as const)
          .default("worker" as const),
      );
  },
  action() {
    return import("#bin/engrenage/issues/actions/check");
  },
});
