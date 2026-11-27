import { command } from "#nexus/cli/index";
import type { HookEvent, HostChecks } from "#metalbrain/runtimes/index";

export default command({
  name: "SubagentStop",
  description: "Record the stopped subagent's run under the main worktree's agent stats, reading Claude's SubagentStop payload from stdin.",
  action() {
    return import("#bin/metalbrain/hook/claude/actions/hostCheck");
  },
  parse(): [keyof HostChecks, HookEvent] {
    return ["recordRun", "SubagentStop"];
  },
});
