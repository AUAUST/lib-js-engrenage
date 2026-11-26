import { Argument } from "@commander-js/extra-typings";

import { defineLazyCommand } from "#nexus/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Store the start time of the tool call in Claude's PreToolUse payload from stdin, or with `guardToolUse`, deny it when the project's guards refuse it.",
      )
      .addArgument(
        new Argument("[check]", "host check to run instead").choices([
          "guardToolUse",
        ] as const),
      );
  },
  action() {
    return import("#bin/metalbrain/hook/claude/actions/preToolUse");
  },
});
