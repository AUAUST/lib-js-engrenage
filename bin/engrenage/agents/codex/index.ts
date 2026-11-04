import { hook } from "#bin/engrenage/agents/codex/hook/index";
import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { registerSubcommands } from "#workflows/cli/operations/registerSubcommands";

export const codex = defineCommand((command) => {
  return registerSubcommands(
    command.description("Integrate the project tools with Codex."),
    {
      hook,
    },
  );
});
