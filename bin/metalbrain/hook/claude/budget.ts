import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Warn the subagent in Claude's PreToolUse payload from stdin once its context outgrows its token budget.",
      )
      .requiredOption(
        "--level <level>",
        "budget level of a brief naming no known Budget: level",
      );
  },
  action() {
    return import("#bin/metalbrain/hook/claude/actions/budget");
  },
});
