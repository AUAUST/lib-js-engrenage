import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Block a subagent's first stop on a tree failing the worktree gate, reading Claude's SubagentStop payload from stdin.",
    );
  },
  action() {
    return import("#bin/engrenage/agents/claude/hook/actions/stop");
  },
});
