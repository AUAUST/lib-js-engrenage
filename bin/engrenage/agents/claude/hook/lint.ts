import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Return the info lint messages of the edited file to Claude, reading Claude's PostToolUse payload from stdin.",
    );
  },
  action() {
    return import("#bin/engrenage/agents/claude/hook/actions/lint");
  },
});
