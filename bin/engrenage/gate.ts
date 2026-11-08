import { Option } from "@commander-js/extra-typings";

import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Fix and check the changed files: ESLint, Prettier, types, structure, sync, related tests and the configured commands.",
      )
      .addOption(
        new Option(
          "--staged",
          "fix and check the staged files, and stage the fixes (default)",
        ).conflicts("worktree"),
      )
      .addOption(
        new Option(
          "--worktree",
          "fix and check the changes against HEAD and the untracked files",
        ).conflicts("staged"),
      )
      .addOption(
        new Option(
          "--everyone",
          "run only the checks every commit must pass",
        ).conflicts("worktree"),
      )
      .addOption(
        new Option(
          "--message <file>",
          "check only the commit message stored in a file",
        ).conflicts(["staged", "worktree", "everyone"]),
      );
  },
  action() {
    return import("#bin/engrenage/actions/gate");
  },
});
