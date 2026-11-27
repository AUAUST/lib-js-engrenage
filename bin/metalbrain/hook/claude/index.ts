import { argument, command, option } from "#nexus/cli/index";
import type { HookEvent, HostChecks } from "#metalbrain/runtimes/index";

export default command({
  name: "claude",
  description: "Run the metalbrain Claude Code hooks.",
  subcommands: [
    command({
      name: "PreToolUse",
      description: "Store the start time of the tool call in Claude's PreToolUse payload from stdin, or with `guardToolUse`, deny it when the project's guards refuse it.",
      arguments: [
        argument({
          name: "check",
          description: "host check to run instead",
          optional: true,
          choices: ["guardToolUse"],
        }),
      ],
      action() {
        return import("#bin/metalbrain/hook/claude/actions/preToolUse");
      },
    }),
    command({
      name: "PostToolUse",
      description: "Log the tool call in Claude's PostToolUse payload from stdin, with its duration, output size and cost; instead, with `limitOutput`, notice a shell output past the project's output limit, or with `lintEdit`, suggest the info lint messages of the edited file.",
      arguments: [
        argument({
          name: "check",
          description: "host check to run instead",
          optional: true,
          choices: ["limitOutput", "lintEdit"],
        }),
      ],
      action() {
        return import("#bin/metalbrain/hook/claude/actions/postToolUse");
      },
    }),
    command({
      name: "SubagentStart",
      description: "Mark the started subagent as running under the main worktree's agent stats until its next stop, reading Claude's SubagentStart payload from stdin.",
      action() {
        return import("#bin/metalbrain/hook/claude/actions/hostCheck");
      },
      parse(): [keyof HostChecks, HookEvent] {
        return ["startRun", "SubagentStart"];
      },
    }),
    command({
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
    }),
    command({
      name: "SubagentStop",
      description: "Record the stopped subagent's run under the main worktree's agent stats, reading Claude's SubagentStop payload from stdin.",
      action() {
        return import("#bin/metalbrain/hook/claude/actions/hostCheck");
      },
      parse(): [keyof HostChecks, HookEvent] {
        return ["recordRun", "SubagentStop"];
      },
    }),
    command({
      name: "thoroughness",
      description: "Warn the subagent in Claude's PreToolUse payload from stdin once its context outgrows the token limit of its thoroughness level.",
      options: [
        option({
          name: "level",
          type: "string",
          placeholder: "level",
          description: "thoroughness level of a brief naming no known Thoroughness: level",
          required: true,
        }),
      ],
      action() {
        return import("#bin/metalbrain/hook/claude/actions/thoroughness");
      },
    }),
  ],
});
