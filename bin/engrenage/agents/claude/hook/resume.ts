import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Deny a message resuming a stopped agent whose context grew past its role's freshness limit, reading Claude's PreToolUse payload from stdin.",
    );
  },
  action() {
    return import("#bin/engrenage/agents/claude/hook/actions/resume");
  },
});
