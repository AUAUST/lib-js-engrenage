import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Block a gated agent's first stop on a tree failing the worktree gate, reading Claude's payload from stdin: a subagent's SubagentStop, or the session's Stop when the session runs a gated agent, as a headless dispatch does.",
    );
  },
  action() {
    return import("#bin/engrenage/agents/claude/hook/actions/stop");
  },
});
