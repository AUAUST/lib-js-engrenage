import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Warn the subagent in Claude's PreToolUse payload from stdin once its context outgrows the token limit of its thoroughness level.",
      )
      .requiredOption(
        "--level <level>",
        "thoroughness level of a brief naming no known Thoroughness: level",
      );
  },
  action() {
    return import("#bin/metalbrain/hook/claude/actions/thoroughness");
  },
});
