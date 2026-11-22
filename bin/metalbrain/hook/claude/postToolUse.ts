import { Argument } from "@commander-js/extra-typings";

import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Log the tool call in Claude's PostToolUse payload from stdin, with its duration, output size and cost, or with `limitOutput`, notice a shell output past the project's output limit.",
      )
      .addArgument(
        new Argument("[check]", "host check to run instead").choices([
          "limitOutput",
        ] as const),
      );
  },
  action() {
    return import("#bin/metalbrain/hook/claude/actions/postToolUse");
  },
});
