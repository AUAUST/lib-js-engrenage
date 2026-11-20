import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Route Claude's PostToolUse payload from stdin: the info lint messages of an edited file, and a warning on shell output past `agents.outputLimit`.",
    );
  },
  action() {
    return import("#bin/engrenage-hook/claude/actions/postToolUse");
  },
});
