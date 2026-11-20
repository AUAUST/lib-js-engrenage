import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Store the start time of the tool call in Claude's PreToolUse payload from stdin.",
    );
  },
  action() {
    return import("#bin/metalbrain/hook/claude/actions/preToolUse");
  },
});
