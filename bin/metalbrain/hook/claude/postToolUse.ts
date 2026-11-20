import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Log the tool call in Claude's PostToolUse payload from stdin, with its duration, output size and cost.",
    );
  },
  action() {
    return import("#bin/metalbrain/hook/claude/actions/postToolUse");
  },
});
