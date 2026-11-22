import { Argument } from "@commander-js/extra-typings";

import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Log the tool call in Claude's PostToolUse payload from stdin, with its duration, output size and cost; instead, with `limitOutput`, notice a shell output past the project's output limit, or with `lintEdit`, suggest the info lint messages of the edited file.",
      )
      .addArgument(
        new Argument("[check]", "host check to run instead").choices([
          "limitOutput",
          "lintEdit",
        ] as const),
      );
  },
  action() {
    return import("#bin/metalbrain/hook/claude/actions/postToolUse");
  },
});
