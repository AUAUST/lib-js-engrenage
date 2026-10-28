import { hook } from "#bin/engrenage/agents/codex/hook/index";
import { defineCommand } from "#support/commander/utils/defineCommand";
import { registerSubcommands } from "#support/commander/utils/registerSubcommands";

export const codex = defineCommand((command) => {
  return registerSubcommands(
    command.description("Integrate the project tools with Codex."),
    {
      hook,
    },
  );
});
