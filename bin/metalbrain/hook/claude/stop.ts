import { Argument } from "@commander-js/extra-typings";

import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Record the stopped session's run under the main worktree's agent stats, with the runs it ended without a stop, reading Claude's Stop payload from stdin; instead, with `gateStop` from a gated agent's frontmatter, block its first stop on a tree failing the worktree gate.",
      )
      .addArgument(
        new Argument("[check]", "host check to run instead").choices([
          "gateStop",
        ] as const),
      );
  },
  action() {
    return import("#bin/metalbrain/hook/claude/actions/stop");
  },
});
