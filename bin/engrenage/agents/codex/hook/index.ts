// @debt The `auaust/no-dynamic-import` rule forbids the dynamic imports that load each subcommand only when it runs, so the rule is disabled here until it allows lazy command loading (#221).
/* eslint-disable auaust/no-dynamic-import */

import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { registerLazySubcommands } from "#workflows/cli/operations/registerLazySubcommands";

export const hook = defineCommand((command) => {
  return registerLazySubcommands(command, {
    dispatch: {
      description: "Check Codex worker and debugger dispatch readiness.",
      async load() {
        const { dispatch } =
          await import("#bin/engrenage/agents/codex/hook/dispatch");

        return dispatch;
      },
    },
    stop: {
      description:
        "Return verification failures to a stopped Codex worker or debugger.",
      async load() {
        const { stop } = await import("#bin/engrenage/agents/codex/hook/stop");

        return stop;
      },
    },
    github: {
      description:
        "Deny a `gh issue create|edit` body that breaks the issue contract, and warn or deny when a `gh issue create|edit|comment` body is over budget, reading Codex's PreToolUse payload from stdin.",
      async load() {
        const { github } =
          await import("#bin/engrenage/agents/codex/hook/github");

        return github;
      },
    },
  });
});
