import { Option } from "@commander-js/extra-typings";

import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Check that an issue meets the issue contract, listing its open sub-issues to walk first; exit 1 with one line per finding otherwise.",
      )
      .argument("<number>", "issue number", Number)
      .option("--repo <owner/repo>", "repository, else package.json or origin")
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
