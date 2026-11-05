// @debt The `auaust/no-dynamic-import` rule forbids the dynamic imports that load each subcommand only when it runs, so the rule is disabled here until it allows lazy command loading (#221).
/* eslint-disable auaust/no-dynamic-import */

import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { registerLazySubcommands } from "#workflows/cli/operations/registerLazySubcommands";

export const codex = defineCommand((command) => {
  return registerLazySubcommands(command, {
    hook: {
      description: "Run the Codex hooks of the project.",
      async load() {
        const { hook } = await import("#bin/engrenage/agents/codex/hook/index");

        return hook;
      },
    },
  });
});
