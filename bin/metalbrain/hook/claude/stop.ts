import { argument, command } from "#nexus/cli/index";

export default command({
  name: "Stop",
  description: "Record the stopped session's run under the main worktree's agent stats, with the runs it ended without a stop, reading Claude's Stop payload from stdin; instead, with `gateStop` from a gated agent's frontmatter, block its first stop on a tree failing the worktree gate.",
  arguments: [
    argument({
      name: "check",
      description: "host check to run instead",
      optional: true,
      choices: ["gateStop"],
    }),
  ],
  action() {
    return import("#bin/metalbrain/hook/claude/actions/stop");
  },
});
