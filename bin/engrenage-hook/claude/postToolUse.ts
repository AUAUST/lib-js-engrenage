import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Report the info lint messages of the file edited in Claude's PostToolUse payload from stdin.",
    );
  },
  action() {
    return import("#bin/engrenage-hook/claude/actions/lint");
  },
});
