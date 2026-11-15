import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Mark the started subagent as running under the main worktree's agent stats until its next stop, reading Claude's SubagentStart payload from stdin.",
    );
  },
  action() {
    return import("#bin/engrenage/agents/claude/hook/actions/start");
  },
});
