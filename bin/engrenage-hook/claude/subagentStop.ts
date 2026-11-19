import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Record the stopped subagent's run under the main worktree's agent stats, reading Claude's SubagentStop payload from stdin.",
    );
  },
  action() {
    return import("#bin/engrenage-hook/claude/actions/subagentStop");
  },
});
