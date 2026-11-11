import { Option } from "@commander-js/extra-typings";

import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Check each ref: a ref with a local draft checks its manifest, its body against its type's contract and its references, without network; any other issue number checks the published issue against the issue contract, reporting its sub-issues and blocking issues as open, closed by a local `Closes` commit or closed on GitHub, and the local commits `Towards` it. Exit 1 with one line per finding.",
      )
      .argument(
        "<refs>",
        "comma-separated draft file stems or issue numbers, such as `123,new-foo`",
        (value) => {
          return value
            .split(",")
            .map((stem) => stem.trim())
            .filter((stem) => stem !== "");
        },
      )
      .addOption(
        new Option("--for <role>", "who a published issue is checked for")
          .choices(["worker", "debugger"] as const)
          .default("worker" as const),
      );
  },
  action() {
    return import("#bin/engrenage/planning/issue/actions/check");
  },
});
