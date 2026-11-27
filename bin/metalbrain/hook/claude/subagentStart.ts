import { command } from "#nexus/cli/index";
import type { HookEvent, HostChecks } from "#metalbrain/runtimes/index";

export default command({
  name: "SubagentStart",
  description: "Mark the started subagent as running under the main worktree's agent stats until its next stop, reading Claude's SubagentStart payload from stdin.",
  action() {
    return import("#bin/metalbrain/hook/claude/actions/hostCheck");
  },
  parse(): [keyof HostChecks, HookEvent] {
    return ["startRun", "SubagentStart"];
  },
});
