import { command, option } from "#nexus/cli/index";

export default command({
  name: "gate",
  description: "Fix and check the changed files: ESLint, Prettier, types, structure, sync, related tests and the configured commands; with --all, check the whole project without fixing anything.",
  options: [
    option({
      name: "staged",
      type: "boolean",
      description: "fix and check the staged files, and stage the fixes (default)",
      conflicts: ["worktree"],
    }),
    option({
      name: "worktree",
      type: "boolean",
      description: "fix and check the changes against HEAD and the untracked files",
      conflicts: ["staged"],
    }),
    option({
      name: "everyone",
      type: "boolean",
      description: "run only the fixes and checks every commit must pass, or only the message checks every commit message must pass",
      conflicts: ["worktree"],
    }),
    option({
      name: "message",
      type: "string",
      placeholder: "file",
      description: "check only the commit message stored in a file",
      conflicts: ["staged", "worktree"],
    }),
    option({
      name: "all",
      type: "boolean",
      description: "check the whole project without fixing anything: every step and the configured commands",
      conflicts: ["staged", "worktree", "everyone", "message"],
    }),
    option({
      name: "timings",
      type: "boolean",
      description: "list the duration of every stage and step instead of the one-line total",
      conflicts: ["message"],
    }),
  ],
  action() {
    return import("#bin/engrenage/actions/gate");
  },
});
