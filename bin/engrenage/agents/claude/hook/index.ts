import { defineLegacyCommand } from "#workflows/cli/operations/defineLegacyCommand";
import { registerLazySubcommands } from "#workflows/cli/operations/registerLazySubcommands";

export const hook = defineLegacyCommand((command) => {
  return registerLazySubcommands(command, {
    dispatch: {
      description:
        "Deny a `worker` or `debugger` dispatch whose `Issue: <owner>/<repo>#<n>` is not ready, reading Claude's PreToolUse payload from stdin.",
      async load() {
        const { dispatch } =
          await import("#bin/engrenage/agents/claude/hook/dispatch");

        return dispatch;
      },
    },
    git: {
      description:
        "Deny a `git` command that skips the commit gate, reading Claude's PreToolUse payload from stdin.",
      async load() {
        const { git } = await import("#bin/engrenage/agents/claude/hook/git");

        return git;
      },
    },
    github: {
      description:
        "Deny a `gh issue create|edit` body that breaks the issue contract, and warn or deny when a `gh issue create|edit|comment` body is over budget, reading Claude's PreToolUse payload from stdin.",
      async load() {
        const { github } =
          await import("#bin/engrenage/agents/claude/hook/github");

        return github;
      },
    },
    stop: {
      description:
        "Block a subagent's first stop on a tree failing the worktree gate, reading Claude's SubagentStop payload from stdin.",
      async load() {
        const { stop } = await import("#bin/engrenage/agents/claude/hook/stop");

        return stop;
      },
    },
  });
});
