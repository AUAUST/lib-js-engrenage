import { hook } from "#bin/engrenage/agents/claude/hook/index";
import { defineCommand } from "#support/commander/utils/defineCommand";
import { registerSubcommands } from "#support/commander/utils/registerSubcommands";

export const claude = defineCommand((command) => {
  return registerSubcommands(
    command.description("Integrate the project tools with Claude Code."),
    {
      hook,
    },
  );
});
