// @debt The `auaust/no-dynamic-import` rule forbids the dynamic imports that load each subcommand only when it runs, so the rule is disabled here until it allows lazy command loading (#221).
/* eslint-disable auaust/no-dynamic-import */

import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { registerLazySubcommands } from "#workflows/cli/operations/registerLazySubcommands";

export const hook = defineCommand((command) => {
  return registerLazySubcommands(command, {
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
        "Warn or deny when the body of a `gh issue create|edit|comment` command is over budget, reading Claude's PreToolUse payload from stdin.",
      async load() {
        const { github } =
          await import("#bin/engrenage/agents/claude/hook/github");

        return github;
      },
    },
  });
});
