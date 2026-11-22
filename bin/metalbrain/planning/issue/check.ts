import { Option } from "@commander-js/extra-typings";

import {
  collectArgument,
  collectListArgument,
  defineLazyCommand,
} from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Check each ref: a ref with a local draft checks its manifest, its body against its type's contract and its references, without network; any other issue number checks the published issue against the issue contract, reporting its sub-issues and blocking issues as open, closed by an unpushed `Closes` commit of its repository's checkout or closed on GitHub, and the checkout's commits `Towards` it. Exit 1 with one line per finding.",
      )
      .argument(
        "<refs...>",
        "draft file stems or issue numbers, comma- or space-separated, such as `123,new-foo` or `123 new-foo`",
        collectListArgument,
      )
      .addOption(
        new Option("--for <role>", "who a published issue is checked for")
          .choices(["worker", "debugger"] as const)
          .default("worker" as const),
      )
      .option(
        "--checkout <checkout>",
        "checkout whose commits up to `<ref>`, `HEAD` by default, count for its repository's issues, as `<registered short name>=<directory>[@<ref>]`, repeatable; the current directory counts for its own repository unless a checkout names it; end with `@HEAD` when the directory holds an `@`",
        collectArgument,
        [],
      );
  },
  action() {
    return import("#bin/metalbrain/planning/issue/actions/check");
  },
});
