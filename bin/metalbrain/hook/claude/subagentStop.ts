import { defineLazyCommand } from "#workflows/cli/index";
import type { HostChecks } from "#metalbrain/runtimes/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Record the stopped subagent's run under the main worktree's agent stats, reading Claude's SubagentStop payload from stdin.",
    );
  },
  action() {
    return import("#bin/metalbrain/hook/claude/actions/hostCheck");
  },
  parse(): [keyof HostChecks] {
    return ["recordRun"];
  },
});
