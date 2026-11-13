import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Record the stopped session's or subagent's run under the main worktree's agent stats, reading Claude's Stop or SubagentStop payload from stdin.",
    );
  },
  action() {
    return import("#bin/engrenage/agents/claude/hook/actions/record");
  },
});
