import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Deny a `worker` or `debugger` dispatch whose `Issue: <owner>/<repo>#<n>` is not ready, reading Claude's PreToolUse payload from stdin.",
    );
  },
  action() {
    return import("#bin/engrenage/agents/claude/hook/actions/dispatch");
  },
});
