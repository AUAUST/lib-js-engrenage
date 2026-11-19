import { Argument } from "@commander-js/extra-typings";

import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Record the stopped session's run, reading Claude's Stop or SubagentStop payload from stdin; from a gated agent's frontmatter (`skill`), block its first stop on a tree failing the worktree gate instead.",
      )
      .addArgument(
        new Argument("[source]", "where the hook is defined").choices([
          "skill",
        ]),
      );
  },
  action() {
    return import("#bin/engrenage-hook/claude/actions/stop");
  },
  parse(source) {
    return [source];
  },
});
