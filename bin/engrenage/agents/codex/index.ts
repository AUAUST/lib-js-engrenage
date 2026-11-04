import { hook } from "#bin/engrenage/agents/codex/hook/index";
import { defineCommand } from "#cli/utils/defineCommand";
import { registerSubcommands } from "#cli/utils/registerSubcommands";

export const codex = defineCommand((command) => {
  return registerSubcommands(
    command.description("Integrate the project tools with Codex."),
    {
      hook,
    },
  );
});
